import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

interface UserProfile {
  name: string;
  degree: string;
  role: string;
  institution: string;
  location: string;
  photoURL: string;
  introduction: string;
  desciplines: string[];
  skills: string[];
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
          {userProfile.desciplines?.map((descipline, index) => (
            <li key={index}>{descipline}</li>
          ))}
        </ul>
        <h4 className="mt-4 font-semibold text-gray-400">
          Skills and Expertise
        </h4>
        <ul className="list-disc list-inside flex flex-wrap gap-2">
          {userProfile.skills?.map((skill, index) => (
            <span key={index} className="">
              <li>{skill}</li>
            </span>
          ))}
        </ul>
        <h4 className="mt-4 font-semibold text-gray-400">Activities</h4>
      </CardContent>
    </Card>
  );
};

export default PeopleProfileCard;
