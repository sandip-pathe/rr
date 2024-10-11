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

interface UserProfile {
  name: string;
  degree: string;
  position: string;
  institution: string;
  location: string;
  researchInterestScore: number;
  citations: number;
  hIndex: number;
  introduction: string;
  disciplines: string[];
  skills: string[];
  activity: {
    researchItems: ResearchItem[];
    questions: number;
    answers: number;
  };
  coAuthors: string[];
  followers: string[];
}

const PeopleProfileCard = (userProfile: UserProfile) => {
  return (
    <Card className="bg-[#252525] border-0">
      <CardHeader className="border-b border-gray-200">
        <h3 className="font-semibold text-xl">About {userProfile.name}</h3>
      </CardHeader>
      <CardDescription>
        <p className="mt-2 text-base text-white pl-6">
          {userProfile.introduction}
        </p>
      </CardDescription>
      <CardContent>
        <h4 className="mt-4 font-semibold text-gray-400">Disciplines</h4>
        <ul className="list-disc list-inside flex flex-wrap gap-2">
          {userProfile.disciplines.map((discipline, index) => (
            <li key={index}>{discipline}</li>
          ))}
        </ul>
        <h4 className="mt-4 font-semibold text-gray-400">
          Skills and Expertise
        </h4>
        <ul className="list-disc list-inside flex flex-wrap gap-2">
          {userProfile.skills.map((skill, index) => (
            <span key={index} className="">
              <li>{skill}</li>
            </span>
          ))}
        </ul>
        <h4 className="mt-4 font-semibold text-gray-400">Activities</h4>
        <p>
          {userProfile.activity.researchItems.length} Research Items,{" "}
          {userProfile.activity.questions} Questions,{" "}
          {userProfile.activity.answers} Answers
        </p>
      </CardContent>
    </Card>
  );
};

export default PeopleProfileCard;
