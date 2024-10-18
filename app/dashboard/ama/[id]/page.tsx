"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface Reply {
  id: number;
  content: string;
  author: string;
  created_at: string;
  replies?: Reply[]; // Nested replies
}

interface Question {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  replies: Reply[]; // Direct replies to the question
}

const QuestionThread = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const router = useRouter();
  const id = 1;

  // Dummy data for a detailed thread (replace with API later)
  const dummyQuestion: Question = {
    id: 1,
    title:
      "How to enhance collaboration between academia and industry in research?",
    content:
      "What are the best practices for fostering collaboration between academic researchers and industries for innovative projects. What are the best practices for fostering collaboration between academic researchers and industries for innovative projects. What are the best practices for fostering collaboration between academic researchers and industries for innovative projects?",
    author: "Dr. Smith",
    created_at: "2024-10-01",
    replies: [
      {
        id: 1,
        content:
          "I think setting up common research centers between universities and companies can help.",
        author: "Prof. John Doe",
        created_at: "2024-10-02",
        replies: [
          {
            id: 2,
            content:
              "Absolutely! It creates a win-win situation and facilitates technology transfer.",
            author: "Dr. Emily Clark",
            created_at: "2024-10-03",
          },
          {
            id: 3,
            content:
              "Yes, but who should fund these initiatives? Public or private entities?",
            author: "Dr. Watson",
            created_at: "2024-10-04",
            replies: [
              {
                id: 4,
                content:
                  "A mix of both public and private funding is often the most sustainable model.",
                author: "Prof. John Doe",
                created_at: "2024-10-05",
              },
            ],
          },
        ],
      },
      {
        id: 5,
        content:
          "Don’t forget the importance of IP (Intellectual Property) agreements between parties.",
        author: "Prof. Ada Lovelace",
        created_at: "2024-10-02",
      },
    ],
  };

  useEffect(() => {
    if (id) {
      setQuestion(dummyQuestion);
    }
  }, [id]);

  if (!question)
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-inherit">
          <Spiner />
        </div>
      </Layout>
    );

  const renderReplies = (replies: Reply[], level = 0) => {
    return replies.map((reply) => (
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
          {reply.replies && renderReplies(reply.replies, level + 1)}
        </div>
      </div>
    ));
  };

  return (
    <Layout>
      <div className="flex flex-row gap-5">
        <div className="ml-10 mt-10 w-2/3">
          <CardHeader className="p-0 flex flex-row items-center gap-4 justify-start">
            <Avatar className="h-8 w-8 bg-gray-800 overflow-clip">
              <AvatarImage
                src="https://placehold.co/400"
                className="overflow-auto "
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <CardTitle className="font-medium text-base text-gray-100">
              {question.author}
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              {"• "}
              {new Date(question.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardTitle className="py-2">{question.title}</CardTitle>
          <CardContent className="py-2 px-0">
            <p className="text-white text-sm font-normal">{question.content}</p>
          </CardContent>
          <CardFooter className="flex space-x-4 p-0 text-gray-400 text-sm">
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
          <div className="mt-8">{renderReplies(question.replies)}</div>
        </div>
        <div className="mt-10 w-1/3"></div>
      </div>
    </Layout>
  );
};

export default QuestionThread;
