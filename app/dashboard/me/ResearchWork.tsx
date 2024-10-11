import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

interface ResearchItem {
  title: string;
  type: string; // e.g., Article, Conference Paper
  date: string; // Publication date
  reads: number; // Number of reads
  citations: number; // Number of citations
  authors?: string[];
}
interface ActivityProps {
  researchItems: ResearchItem[];
  questions: number;
  answers: number;
}

const ResearchWork = ({ researchItems, questions, answers }: ActivityProps) => {
  return (
    <Card className="bg-[#252525] border-0">
      <CardHeader>
        <h3 className="font-semibold text-xl">Research Works</h3>
      </CardHeader>
      <CardDescription className="border-b border-gray-200 pb-5 mb-10">
        <p className="ml-6">
          {researchItems.length} Research Items, {questions} Questions,{" "}
          {answers} Answers
        </p>
      </CardDescription>
      <CardContent>
        <ul>
          {researchItems.map((item, index) => (
            <div>
              <div key={index} className="mb-5">
                <p className="text-green-500 text-sm">Recently Added</p>
                <h2 className="text-lg font-bold py-4">{item.title}</h2>
                <div className="flex flex-row gap-5">
                  <span className=" bg-green-300 text-green-950 font-semibold px-5">
                    New
                  </span>
                  <span className="bg-cyan-300 text-green-950 font-semibold px-5">
                    {item.type}
                  </span>
                  <span>{item.date}</span>
                  <span>IGARSS 2024 - 2024 IEEE International Geoscience</span>
                </div>

                <div className="flex flex-row mt-5 gap-5">
                  {item.authors?.map((item, index) => (
                    <span
                      key={index}
                      className="flex flex-row items-center gap-2"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage />
                        <AvatarFallback>{item.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p>{item}</p>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <span className="border border-cyan-300 rounded-full px-2">
                  Request full text
                </span>
                <span>Like · Save · Reccomend</span>
              </div>
              <div className="my-10 shadow-md border-b border-gray-200" />
            </div>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="items-center">
        <p>View All Research</p>
      </CardFooter>
    </Card>
  );
};

export default ResearchWork;
