"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import {
  FaReply,
  FaShare,
  FaRegCommentDots,
  FaCommentAlt,
} from "react-icons/fa"; // Import icons
import Spiner from "@/components/Spiner";
import { FIREBASE_DB } from "@/FirebaseConfig";
import {
  doc,
  getDoc,
  query,
  collection,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "@/app/auth/AuthContext";

interface Reply {
  id: string;
  content: string;
  author: string;
  created_at: string;
  parent_id?: string;
  replies?: Reply[];
}

interface Question {
  id: string;
  title: string;
  description: string;
  authorName: string;
  created_at: Date;
  replies: Reply[];
}

const QuestionThread = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState<string>("");
  const pathname = usePathname();
  const segments = pathname.split("/");
  const questionId = segments[segments.length - 1];
  const { user, name } = useAuth();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        console.log("questionId", questionId);
        const docRef = doc(FIREBASE_DB, "ama", questionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuestion({ id: docSnap.id, ...docSnap.data() } as Question);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  useEffect(() => {
    const q = query(
      collection(FIREBASE_DB, "ama", questionId, "replies"),
      orderBy("created_at", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReplies = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reply[];
      setReplies(loadedReplies);
    });

    return () => unsubscribe();
  }, [questionId]);

  if (loading)
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-inherit">
          <Spiner />
        </div>
      </Layout>
    );

  if (!question)
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-inherit">
          <p>No questions</p>
        </div>
      </Layout>
    );

  const renderReplies = (
    repliesList: Reply[],
    parentId: string | null = null,
    level = 0
  ) => {
    return repliesList
      .filter((reply) => reply.parent_id === parentId)
      .map((reply) => (
        <div key={reply.id} className="flex">
          <div className={`w-full ${level > 0 ? "ml-10 " : ""}`}>
            <Card className="bg-inherit border-none pb-4">
              <CardHeader className="p-0 flex flex-row items-center gap-4 justify-start">
                <Avatar className="h-8 w-8 bg-gray-800">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <CardTitle className="font-medium text-base text-gray-100">
                  {reply.author}
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  {"• "}
                  {new Date(reply.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="ml-10 py-2 px-0">
                <p className="text-gray-300 text-sm font-normal">
                  {reply.content}
                </p>
              </CardContent>
              <CardFooter className="flex space-x-4 p-0 ml-10 text-gray-400 text-sm">
                <button className="flex items-center gap-2">
                  <FaReply /> Reply
                </button>
                <button className="flex items-center gap-2">
                  <FaShare /> Share
                </button>
                <button className="flex items-center gap-2">
                  <FaRegCommentDots /> Discuss
                </button>
              </CardFooter>
            </Card>
            {renderReplies(replies, reply.id, level + 1)}
          </div>
        </div>
      ));
  };

  const handlePostReply = async () => {
    if (!newReply.trim()) return;
    try {
      await addDoc(collection(FIREBASE_DB, "ama", questionId, "replies"), {
        content: newReply,
        authorId: user?.uid,
        authorName: name || "Anonymous",
        created_at: new Date().toISOString(),
        parent_id: null,
      });
      setNewReply("");
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  return (
    <Layout>
      <div className="flex flex-row gap-5">
        <div className="ml-10 mt-10 w-2/3">
          <CardHeader className="p-0 flex flex-row items-center gap-4 justify-start">
            <Avatar className="h-8 w-8 bg-gray-800">
              <AvatarImage src="https://placehold.co/400" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <CardTitle className="font-medium text-base text-gray-100">
              {question.authorName}
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              {new Date(question.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardTitle className="py-2">{question.title}</CardTitle>
          <CardContent className="py-2 px-0">
            <p className="text-white text-sm font-normal">
              {question.description}
            </p>
          </CardContent>
          <CardFooter className="flex space-x-4 p-0 text-gray-400 text-sm">
            <button className="flex items-center gap-2">
              <FaReply /> Reply
            </button>
            <button className="flex items-center gap-2">
              <FaShare /> Share
            </button>
          </CardFooter>
          <div className="mt-4">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <button
              onClick={handlePostReply}
              className="mt-2 p-2 bg-blue-600 rounded"
            >
              Post Reply
            </button>
          </div>

          <div className="mt-8">{renderReplies(replies)}</div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionThread;
