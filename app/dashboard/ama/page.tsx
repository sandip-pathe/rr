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
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { FaReply, FaShare, FaCommentAlt } from "react-icons/fa";
import Spiner from "@/components/Spiner";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { formatDate } from "./helper";

interface Question {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorId: string;
  created_at: Date;
  answers: { content: string; author: string }[];
}

const PAGE_SIZE = 5;

const AMA = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      setInitialLoading(true);
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
      setInitialLoading(false);
    };

    fetchQuestions();
  }, []);

  const fetchMoreQuestions = async () => {
    if (!lastDoc || !hasMore || loadingMore) return;
    setLoadingMore(true);

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
    setLoadingMore(false);
  };

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
    [initialLoading, loadingMore, hasMore]
  );

  const handleOpenQuestion = (id: string) => {
    router.push(`ama/${id}`);
  };

  const handleNewQuestion = () => {
    router.push("ama/ask");
  };

  return (
    <Layout>
      <div className="flex flex-row">
        <div className="w-2/3 ml-10 mt-5">
          <h1 className="text-2xl font-semibold text-gray-300">
            Ask Me Anything
          </h1>
          <button
            onClick={handleNewQuestion}
            className="text-white hover:text-gray-400 select-none cursor-pointer bg-[#333] px-4 py-2 rounded-md mt-4"
          >
            Ask a question
          </button>

          {initialLoading ? (
            <Spiner />
          ) : questions.length > 0 ? (
            <>
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="my-10 hover:bg-gray-700 hover:cursor-pointer hover:rounded-lg p-3"
                  onClick={() => handleOpenQuestion(q.id)}
                  ref={index === questions.length - 1 ? lastQuestionRef : null}
                >
                  <CardHeader className="p-0 flex flex-row items-center gap-2 justify-start">
                    <Avatar className="h-8 w-8 bg-gray-800 overflow-clip">
                      <AvatarImage
                        src="https://placehold.co/400"
                        className="overflow-auto"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-medium text-base text-gray-400">
                      {q.authorName?.toLowerCase()}
                    </CardTitle>
                    <CardDescription className="text-blue-500 text-sm">
                      {formatDate(q.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardTitle className="py-2 text-xl font-medium text-gray-300">
                    {q.title}
                  </CardTitle>
                  <CardContent className="pb-2 px-0">
                    <p className="text-gray-400 text-xs font-normal line-clamp-6">
                      {q.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex space-x-4 p-0 text-gray-400 text-sm z-5">
                    <button className="flex items-center gap-2">
                      <FaReply /> Reply
                    </button>
                    <button className="flex items-center gap-2">
                      <FaShare /> Share
                    </button>
                    <button className="flex items-center gap-2">
                      <FaCommentAlt />
                    </button>
                  </CardFooter>
                </div>
              ))}
              {loadingMore && <Spiner />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400">No questions yet.</p>
              <button
                onClick={handleNewQuestion}
                className="text-white hover:text-gray-400 select-none cursor-pointer bg-[#333] px-4 py-2 rounded-md mt-4"
              >
                Ask a question
              </button>
            </div>
          )}
        </div>
        <div className="w-1/3"></div>
      </div>
    </Layout>
  );
};

export default AMA;
