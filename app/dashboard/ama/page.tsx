"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
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
import { FaReply, FaShare, FaCommentAlt } from "react-icons/fa"; // Import icons
import Spiner from "@/components/Spiner";

interface Question {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  answers: { content: string; author: string }[];
}

const AMA = () => {
  const [questions, setQuestions] = useState<Question[]>([]);

  const router = useRouter();

  // Dummy data for research, innovation, and publication settings
  const dummyData: Question[] = [
    {
      id: 1,
      title:
        "How to enhance collaboration between academia and industry in research?",
      content:
        "Hey everyone! I’m looking for some advice on navigating serious relationships as a spicy creator, and I wanted to share my journey. Few months ago I met someone who I really clicked with—great conversations, lots of laughter, and a genuine connection. However, once I revealed my work, things got a bit complicated. He was initially intrigued but soon became hesitant. We had an honest conversation about it, and I explained how my job empowers me and doesn’t define my worth. I thought we were on the same page, but I could see he was still struggling with the idea. After a few dates, it became clear that while he liked me, he was unsure if he could fully accept my lifestyle. It was tough because I really liked him, but I knew I needed someone who could embrace all of me.",
      author: "Dr. Smith",
      created_at: "2024-10-01",
      answers: [
        {
          content:
            "One approach is to establish research centers funded by industry. This provides resources for both parties and creates more collaboration opportunities.",
          author: "Prof. John Doe",
        },
      ],
    },
    {
      id: 2,
      title: "What are the key metrics to measure innovation in research?",
      content:
        "How can research labs and universities measure innovation effectively? Are there any standard metrics?",
      author: "Dr. Emma Watson",
      created_at: "2024-09-29",
      answers: [
        {
          content:
            "Patents, number of publications, and collaborations with industry are some common metrics to measure innovation in research.",
          author: "Prof. Mark Henry",
        },
        {
          content:
            "In addition, evaluating the societal impact and technology transfer rate can be good indicators.",
          author: "Dr. Emily Clark",
        },
      ],
    },
    {
      id: 3,
      title: "What role does AI play in academic publications?",
      content:
        "How is AI transforming the process of writing and reviewing academic papers in scientific journals?",
      author: "Dr. Alan Turing",
      created_at: "2024-10-10",
      answers: [
        {
          content:
            "AI can help automate parts of the peer-review process and assist researchers in literature reviews by summarizing large sets of data.",
          author: "Prof. Ada Lovelace",
        },
      ],
    },
    {
      id: 4,
      title: "How to publish research papers in top-tier journals?",
      content:
        "What are some tips for researchers aiming to get their papers published in top-tier journals like Nature and IEEE?",
      author: "Dr. Michael Lee",
      created_at: "2024-10-05",
      answers: [
        {
          content:
            "Focus on solving novel problems, ensure your research is well-structured, and follow the submission guidelines carefully.",
          author: "Dr. Katherine Johnson",
        },
        {
          content:
            "Collaborating with well-established researchers in your field also boosts your chances.",
          author: "Prof. Neil deGrasse Tyson",
        },
      ],
    },
  ];

  useEffect(() => {
    // Simulate fetching dummy data
    setQuestions(dummyData);
  }, []);

  const handleAskPage = () => {
    router.push("ama/ask");
  };

  const handleOpenQuestion = (id: number) => {
    router.push(`ama/${id}`);
  };

  return (
    <Layout>
      <div className="flex flex-row">
        <div className="w-2/3 ml-10 mt-5 p-6">
          <h1 className="text-2xl font-bold mb-4">Ask Me Anything (AMA)</h1>
          <div className="mb-6">
            <Button
              className="text-blue-700 hover:underline"
              onClick={handleAskPage}
            >
              Ask a New Question
            </Button>
          </div>

          {questions.length > 0 ? (
            questions.map((question) => (
              <div
                className="my-10 hover:bg-gray-700 hover:cursor-pointer"
                onClick={() => handleOpenQuestion(question.id)}
              >
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
                <CardTitle className="py-2 text-xl font-medium">
                  {question.title}
                </CardTitle>
                <CardContent className="pb-2 px-0">
                  <p className="text-white text-sm font-normal line-clamp-3">
                    {question.content}
                  </p>
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
              </div>
            ))
          ) : (
            <Spiner />
          )}
        </div>
        <div className="w-1/3"></div>
      </div>
    </Layout>
  );
};

export default AMA;
