"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

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
        "What are the best practices for fostering collaboration between academic researchers and industries for innovative projects?",
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

  return (
    <Layout>
      <div className="container mx-auto mt-10 p-6">
        <h1 className="text-3xl font-bold mb-4">Ask Me Anything (AMA)</h1>
        <div className="mb-6">
          <Button
            className="text-blue-500 hover:underline"
            onClick={handleAskPage}
          >
            Ask a New Question
          </Button>
        </div>

        {questions.length > 0 ? (
          questions.map((question) => (
            <div
              key={question.id}
              className="border p-4 mb-4 rounded-lg bg-gray-800 text-white"
            >
              <h2 className="text-xl font-semibold">{question.title}</h2>
              <p className="mt-2 text-sm text-gray-300">
                By {question.author} on{" "}
                {new Date(question.created_at).toLocaleDateString()}
              </p>
              <p className="mt-4">{question.content}</p>

              {question.answers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Answers:</h3>
                  {question.answers.map((answer, index) => (
                    <div key={index} className="mt-2 border-t pt-2">
                      <p>{answer.content}</p>
                      <p className="text-sm text-gray-400">
                        By {answer.author}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No questions yet. Be the first to ask!</p>
        )}
      </div>
    </Layout>
  );
};

export default AMA;
