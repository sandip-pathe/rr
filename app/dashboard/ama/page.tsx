"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaShare,
  FaCommentAlt,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";
import { RiQuestionAnswerFill } from "react-icons/ri";
import Spiner from "@/components/Spiner";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { formatDate } from "./helper";
import Modal from "@/components/Modal";
import AskQuestionsPage from "./AskQuestionsPage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClipboard } from "@/components/UseClipboard";
import { useAuth } from "@/app/auth/AuthContext";

interface Question {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorId: string;
  created_at: Date;
  answers: { content: string; author: string }[];
  isAnonymous?: boolean;
  tags?: string[];
}

type FilterType = "recent" | "popular" | "saved";

const PAGE_SIZE = 5;

const AMA = () => {
  const { user, name } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { copyToClipboard } = useClipboard();
  const [activeFilter, setActiveFilter] = useState<FilterType>("recent");
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  const fetchQuestions = useCallback(
    async (filter: "recent" | "popular" | "saved" = "recent") => {
      setInitialLoading(true);
      try {
        const q = query(
          collection(FIREBASE_DB, "ama"),
          orderBy("created_at", "desc"),
          limit(PAGE_SIZE)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setQuestions(
            querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              created_at: doc.data().created_at.toDate(),
            })) as Question[]
          );
          setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        toast.error("Failed to load questions");
      } finally {
        setInitialLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchQuestions(activeFilter);
  }, [fetchQuestions, activeFilter]);

  const fetchSavedQuestions = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoadingSaved(true);
    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
      const savedQuestionIds = userDoc.data()?.savedQuestions || [];

      if (savedQuestionIds.length === 0) {
        setSavedQuestions([]);
        return;
      }

      const questionsPromises = savedQuestionIds.map(async (id: string) => {
        const questionDoc = await getDoc(doc(FIREBASE_DB, "ama", id));
        if (questionDoc.exists()) {
          return {
            id: questionDoc.id,
            ...questionDoc.data(),
            created_at: questionDoc.data().created_at.toDate(),
          } as Question;
        }
        return null;
      });

      const questions = (await Promise.all(questionsPromises)).filter(
        Boolean
      ) as Question[];
      setSavedQuestions(questions);
    } catch (error) {
      toast.error("Failed to load saved questions");
    } finally {
      setIsLoadingSaved(false);
    }
  }, [user?.uid]);

  const fetchMoreQuestions = useCallback(async () => {
    if (!lastDoc || !hasMore || loadingMore) return;
    setLoadingMore(true);

    try {
      const q = query(
        collection(FIREBASE_DB, "ama"),
        orderBy("created_at", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setQuestions((prev) => [
          ...prev,
          ...querySnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at.toDate(),
              } as Question)
          ),
        ]);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Failed to load more questions");
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, hasMore, loadingMore]);

  const lastQuestionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (initialLoading || loadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreQuestions();
        }
      });
      if (node) observer.current.observe(node);
    },
    [initialLoading, loadingMore, hasMore, fetchMoreQuestions]
  );

  const handleOpenQuestion = (id: string) => {
    router.push(`ama/${id}`);
  };

  const handleNewQuestion = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchQuestions();
  };

  const handleShareQuestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}dashboard/ama/${id}`;
    copyToClipboard(url);
    toast.success("Link copied to clipboard!");
  };

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      toast.error("Please login to save questions");
      return;
    }

    try {
      const userRef = doc(FIREBASE_DB, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const currentSaved = userDoc.data()?.savedQuestions || [];

      let newSaved;
      if (currentSaved.includes(id)) {
        newSaved = currentSaved.filter((qId: string) => qId !== id);
        toast.success("Removed from saved questions");
      } else {
        newSaved = [...currentSaved, id];
        toast.success("Added to saved questions");
      }

      await updateDoc(userRef, {
        savedQuestions: newSaved,
      });

      // Update local state
      setBookmarkedQuestions(newSaved);

      // Refresh saved questions if we're on that tab
      if (activeFilter === "saved") {
        fetchSavedQuestions();
      }
    } catch (error) {
      toast.error("Failed to update saved questions");
    }
  };

  const getQuestionsToDisplay = () => {
    switch (activeFilter) {
      case "recent":
        return questions;
      case "popular":
        return [...questions].sort(
          (a, b) => (b.answers?.length || 0) - (a.answers?.length || 0)
        );
      case "saved":
        return savedQuestions;
      default:
        return questions;
    }
  };

  const displayedQuestions = getQuestionsToDisplay();

  return (
    <Layout>
      <div className="flex flex-row gap-6 p-6">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-100">
              Ask Me Anything
            </h1>
            <Button
              onClick={handleNewQuestion}
              className="bg-black hover:bg-blue-700 text-white"
            >
              Ask a question
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={activeFilter === "recent" ? "default" : "outline"}
              onClick={() => setActiveFilter("recent")}
              className="flex items-center gap-2"
            >
              <IoMdTrendingUp size={16} />
              Recent
            </Button>
            <Button
              variant={activeFilter === "popular" ? "default" : "outline"}
              onClick={() => setActiveFilter("popular")}
              className="flex items-center gap-2"
            >
              <RiQuestionAnswerFill size={16} />
              Popular
            </Button>
            <Button
              variant={activeFilter === "saved" ? "default" : "outline"}
              onClick={() => {
                setActiveFilter("saved");
                fetchSavedQuestions();
              }}
              className="flex items-center gap-2"
            >
              <FaBookmark size={16} />
              Saved
            </Button>
          </div>

          {initialLoading ? (
            <div className="flex justify-center py-10">
              <Spiner />
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-2">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-black rounded-lg p-6 hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => handleOpenQuestion(q.id)}
                  ref={index === questions.length - 1 ? lastQuestionRef : null}
                >
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gray-700">
                        <AvatarImage
                          src="https://placehold.co/400"
                          className="overflow-auto"
                        />
                        <AvatarFallback>
                          {q.isAnonymous ? "A" : q.authorName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="font-medium text-gray-100">
                          {q.isAnonymous ? "Anonymous" : q.authorName}
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                          {formatDate(q.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardTitle className="text-xl font-semibold text-gray-100 mb-2">
                    {q.title}
                  </CardTitle>

                  <CardContent className="px-0 pb-3">
                    <p className="text-gray-300 line-clamp-3">
                      {q.description}
                    </p>
                  </CardContent>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {q.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-700 text-blue-400 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <CardFooter className="flex justify-between items-center p-0">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaCommentAlt />
                      <span className="text-sm">
                        {q.answers?.length || 0} answers
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => toggleBookmark(q.id, e)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {bookmarkedQuestions.includes(q.id) ? (
                          <FaBookmark className="text-yellow-400" />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleShareQuestion(q.id, e)}
                        className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        <FaShare />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </CardFooter>
                </div>
              ))}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Spiner />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-800 rounded-lg border border-gray-700">
              <RiQuestionAnswerFill size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-400 mb-6">
                No questions yet. Be the first to ask!
              </p>
              <Button
                onClick={handleNewQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ask a question
              </Button>
            </div>
          )}

          {initialLoading || (activeFilter === "saved" && isLoadingSaved) ? (
            <div className="flex justify-center py-10">
              <Spiner />
            </div>
          ) : displayedQuestions.length > 0 ? (
            <div className="space-y-2">
              {displayedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-black rounded-lg p-6 hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => handleOpenQuestion(q.id)}
                  ref={
                    activeFilter !== "saved" &&
                    index === displayedQuestions.length - 1
                      ? lastQuestionRef
                      : null
                  }
                >
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gray-700">
                        <AvatarImage
                          src="https://placehold.co/400"
                          className="overflow-auto"
                        />
                        <AvatarFallback>
                          {q.isAnonymous ? "A" : q.authorName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="font-medium text-gray-100">
                          {q.isAnonymous ? "Anonymous" : q.authorName}
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                          {formatDate(q.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardTitle className="text-xl font-semibold text-gray-100 mb-2">
                    {q.title}
                  </CardTitle>

                  <CardContent className="px-0 pb-3">
                    <p className="text-gray-300 line-clamp-3">
                      {q.description}
                    </p>
                  </CardContent>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {q.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-700 text-blue-400 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <CardFooter className="flex justify-between items-center p-0">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaCommentAlt />
                      <span className="text-sm">
                        {q.answers?.length || 0} answers
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => toggleBookmark(q.id, e)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {bookmarkedQuestions.includes(q.id) ? (
                          <FaBookmark className="text-yellow-400" />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleShareQuestion(q.id, e)}
                        className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        <FaShare />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </CardFooter>
                </div>
              ))}
              {loadingMore && activeFilter !== "saved" && (
                <div className="flex justify-center py-6">
                  <Spiner />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-800 rounded-lg border border-gray-700">
              {activeFilter === "saved" ? (
                <>
                  <FaBookmark size={48} className="text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-6">
                    No saved questions yet. Save questions to see them here!
                  </p>
                </>
              ) : (
                <>
                  <RiQuestionAnswerFill
                    size={48}
                    className="text-gray-500 mb-4"
                  />
                  <p className="text-gray-400 mb-6">
                    No questions yet. Be the first to ask!
                  </p>
                  <Button
                    onClick={handleNewQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Ask a question
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        {/* Right Sidebar */}
        <div className="hidden lg:block lg:w-1/3 space-y-6">
          {/* Popular Questions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <IoMdTrendingUp className="text-blue-400" />
              Trending Questions
            </h2>
            <div className="space-y-4">
              {questions
                .sort(
                  (a, b) => (b.answers?.length || 0) - (a.answers?.length || 0)
                )
                .slice(0, 3)
                .map((q) => (
                  <div
                    key={q.id}
                    className="p-3 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                    onClick={() => handleOpenQuestion(q.id)}
                  >
                    <h3 className="text-gray-100 font-medium line-clamp-2">
                      {q.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-blue-400">
                        {q.answers?.length || 0} answers
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-2">
              Stay Updated
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest questions and answers delivered to your inbox
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button className="bg-black hover:bg-blue-700 text-white">
                Subscribe
              </Button>
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-2">
              Community Guidelines
            </h2>
            <ul className="text-gray-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Be respectful and kind
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Keep questions clear and concise
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                Provide constructive answers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                No spam or self-promotion
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Question Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="h-full flex flex-col">
          <AskQuestionsPage onClick={handleCloseModal} />
        </div>
      </Modal>
    </Layout>
  );
};

export default AMA;
