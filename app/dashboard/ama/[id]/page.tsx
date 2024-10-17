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
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

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
      "What are the best practices for fostering collaboration between academic researchers and industries for innovative projects?",
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
      setQuestion(dummyQuestion); // Set dummy question for now
    }
  }, [id]);

  if (!question) return <p>Loading...</p>;

  const renderReplies = (replies: Reply[], level = 0) => {
    return replies.map((reply) => (
      <div key={reply.id} className="flex">
        {/* Left line and indentation */}
        <div
          className={`border-l border-gray-500 w-full ${
            level > 0 ? "ml-6" : ""
          }`}
          style={{ paddingLeft: "20px" }} // Add padding based on nesting level
        >
          <Card>
            <CardHeader className="items-center flex flex-row gap-5 justify-start">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-sm">
                  {reply.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="font-semibold text-gray-200">
                {reply.author}
              </CardTitle>
              <CardDescription>
                Replied on {new Date(reply.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white">{reply.content}</p>
            </CardContent>
          </Card>

          {/* Render nested replies */}
          {reply.replies && renderReplies(reply.replies, level + 1)}
        </div>
      </div>
    ));
  };

  return (
    <Layout>
      <div className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <h2 className="text-xl">{question.content}</h2>
          <p className="mt-2 text-sm text-gray-300">
            Asked by {question.author} on{" "}
            {new Date(question.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Replies:</h3>
          {renderReplies(question.replies)}
        </div>
      </div>
    </Layout>
  );
};

export default QuestionThread;
