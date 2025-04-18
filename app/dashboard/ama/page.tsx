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
import { copyLinkToClipboard, formatDate } from "./helper";
import Modal from "@/components/Modal";
import AskQuestionsPage from "./AskQuestionsPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorId: string;
  created_at: Date;
  isAnonymous?: boolean;
  tags?: string[];
  replies?: Reply[];
  repliesCount?: number;
  views?: number;
  lastReplyDate?: Date;
}

interface Reply {
  id: string;
  created_at: Date;
}

type FilterType = "recent" | "popular" | "saved";

const PAGE_SIZE = 5;

const calculateEngagementScore = (question: Question): number => {
  const replyCount = question.repliesCount || question.replies?.length || 0;
  const viewCount = question.views || 1; // Avoid division by zero
  const daysSinceCreation = Math.max(
    1,
    Math.floor(
      (new Date().getTime() - question.created_at.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Score considers:
  // 1. Reply count (weight: 40%)
  // 2. Replies per view ratio (weight: 30%)
  // 3. Recency (weight: 30%) - newer questions get a slight boost
  return (
    replyCount * 0.4 +
    (replyCount / viewCount) * 100 * 0.3 +
    (1 / daysSinceCreation) * 0.3
  );
};

const AMA = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("recent");
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const { toast } = useToast();

  // Initialize bookmarked questions from user data
  useEffect(() => {
    const fetchUserBookmarks = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
        const saved = userDoc.data()?.savedQuestions || [];
        setBookmarkedQuestions(saved);
      } catch (error) {
        console.error("Failed to fetch bookmarks", error);
      }
    };

    fetchUserBookmarks();
  }, [user?.uid]);

  const fetchQuestions = useCallback(async () => {
    setInitialLoading(true);
    try {
      const q = query(
        collection(FIREBASE_DB, "ama"),
        orderBy("created_at", "desc"),
        limit(PAGE_SIZE)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const fetchedQuestions = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at.toDate(),
            repliesCount: data.replies?.length || 0,
            lastReplyDate:
              data.replies?.length > 0
                ? new Date(data.replies[data.replies.length - 1].created_at)
                : undefined,
          } as Question;
        });

        setQuestions(fetchedQuestions);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching questions",
      });
    } finally {
      setInitialLoading(false);
    }
  }, []);

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
          const data = questionDoc.data();
          return {
            id: questionDoc.id,
            ...data,
            created_at: data.created_at.toDate(),
            repliesCount: data.replies?.length || 0,
          } as Question;
        }
        return null;
      });

      const questions = (await Promise.all(questionsPromises)).filter(
        Boolean
      ) as Question[];
      setSavedQuestions(questions);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching saved questions",
      });
    } finally {
      setIsLoadingSaved(false);
    }
  }, [user?.uid]);

  const fetchMoreQuestions = useCallback(async () => {
    if (!lastDoc || !hasMore || loadingMore || activeFilter !== "recent")
      return;
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
        const newQuestions = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at.toDate(),
            repliesCount: data.replies?.length || 0,
            lastReplyDate:
              data.replies?.length > 0
                ? new Date(data.replies[data.replies.length - 1].created_at)
                : undefined,
          } as Question;
        });

        setQuestions((prev) => [...prev, ...newQuestions]);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching more questions",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, hasMore, loadingMore, activeFilter]);

  const lastQuestionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (
        initialLoading ||
        loadingMore ||
        !hasMore ||
        activeFilter !== "recent"
      )
        return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreQuestions();
        }
      });
      if (node) observer.current.observe(node);
    },
    [initialLoading, loadingMore, hasMore, fetchMoreQuestions, activeFilter]
  );

  const getQuestionsToDisplay = () => {
    switch (activeFilter) {
      case "recent":
        return questions;
      case "popular":
        // Sort by engagement score first, then by recency
        return [...questions].sort((a, b) => {
          const scoreA = calculateEngagementScore(a);
          const scoreB = calculateEngagementScore(b);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.created_at.getTime() - a.created_at.getTime();
        });
      case "saved":
        return savedQuestions;
      default:
        return questions;
    }
  };

  const displayedQuestions = getQuestionsToDisplay();

  useEffect(() => {
    if (activeFilter === "recent") {
      fetchQuestions();
    } else if (activeFilter === "saved") {
      fetchSavedQuestions();
    }
  }, [activeFilter, fetchQuestions, fetchSavedQuestions]);

  const handleOpenQuestion = (id: string) => {
    router.push(`ama/${id}`);
  };

  const handleNewQuestion = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (activeFilter === "recent") {
      fetchQuestions();
    }
  };

  const handleShareQuestion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/dashboard/ama/${id}`;
    await copyLinkToClipboard(url);
    toast({
      title: "Link copied to clipboard!",
    });
  };

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Please login to save questions.",
      });
      return;
    }

    try {
      const userRef = doc(FIREBASE_DB, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const currentSaved = userDoc.data()?.savedQuestions || [];

      let newSaved;
      if (currentSaved.includes(id)) {
        newSaved = currentSaved.filter((qId: string) => qId !== id);
        toast({
          title: "Removed from saved questions.",
        });
      } else {
        newSaved = [...currentSaved, id];
        toast({
          title: "Added to saved questions",
        });
      }

      await updateDoc(userRef, {
        savedQuestions: newSaved,
      });

      setBookmarkedQuestions(newSaved);

      // If we're on the saved tab, refresh the list
      if (activeFilter === "saved") {
        fetchSavedQuestions();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating saved questions",
      });
    }
  };

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
              className="bg-white hover:bg-blue-200 text-black"
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
              onClick={() => setActiveFilter("saved")}
              className="flex items-center gap-2"
            >
              <FaBookmark size={16} />
              Saved
            </Button>
          </div>

          {initialLoading || (activeFilter === "saved" && isLoadingSaved) ? (
            <div className="flex justify-center py-10">
              <Spiner />
            </div>
          ) : displayedQuestions.length > 0 ? (
            <div className="space-y-2">
              {displayedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="rounded-lg p-6 hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={() => handleOpenQuestion(q.id)}
                  ref={
                    activeFilter === "recent" &&
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
                        {q.replies?.length || 0} replies
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
              {loadingMore && activeFilter === "recent" && (
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
                    className="bg-blue-200 hover:bg-blue-700 text-gray-900"
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
              {[...questions]
                .sort((a, b) => {
                  const scoreA = calculateEngagementScore(a);
                  const scoreB = calculateEngagementScore(b);
                  return scoreB - scoreA;
                })
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
                        {q.repliesCount || q.replies?.length || 0} replies
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(q.lastReplyDate || q.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
          <AskQuestionsPage onClick={handleCloseModal} />
        </div>
      </Modal>
    </Layout>
  );
};

export default AMA;
