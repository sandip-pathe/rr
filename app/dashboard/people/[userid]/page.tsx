import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import ResearchWork from "./ResearchWork";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PeopleProfileCard from "./UserProfile";
import { Button } from "@/components/ui/button";
import { FaStickyNote } from "react-icons/fa";

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

const userProfile: UserProfile = {
  name: "Akhil Masurkar",
  degree: "Master of Engineering",
  position: "Assistant Professor at Vidyalankar Institute of Technology",
  institution: "Vidyalankar Institute of Technology",
  location: "Mumbai, India",
  researchInterestScore: 3.4,
  citations: 4,
  hIndex: 1,
  introduction: "Microwave Remote Sensing, PolSAR Image Processing",
  disciplines: ["Electronic Engineering"],
  skills: [
    "MATLAB Simulation",
    "Signal Processing",
    "Electronics and Communication Engineering",
    "Electrical & Electronics Engineering",
  ],
  activity: {
    researchItems: [
      {
        title:
          "Performance Evaluation of Optimization Functions for Neural Network Classifier Using Decomposed Polsar Images",
        type: "Conference Paper",
        date: "July 2024",
        reads: 12,
        citations: 0,
        authors: ["Akhil M", "Sandip P", "Arya M"],
      },
      {
        title:
          "Performance Evaluation of Optimization Functions for Neural Network Classifier Using Decomposed Polsar Images for Mangrove Detection",
        type: "Conference Paper",
        date: "July 2024",
        reads: 2,
        citations: 0,
        authors: ["Varsha T", "Sandip P", "Arya M"],
      },
      {
        title:
          "Performance analysis of SAR filtering techniques using SVM and Wishart Classifier",
        type: "Article",
        date: "March 2024",
        reads: 29,
        citations: 2,
      },
      {
        title:
          "Development of Generalized Machine Learning Model to Classify PolSAR Data",
        type: "Conference Paper",
        date: "July 2023",
        reads: 30,
        citations: 0,
      },
      {
        title: "NPK And Oxygen Regulation System for Hydroponics",
        type: "Conference Paper",
        date: "December 2021",
        reads: 20,
        citations: 1,
      },
    ],
    questions: 0,
    answers: 0,
  },
  coAuthors: [
    "Rohin Daruwala",
    "Varsha Turkar",
    "Anup Kumar Das",
    "Jay Hegshetye",
    "Vedant Manoj Shirsekar",
  ],
  followers: ["Vedant Manoj Shirsekar", "Javed Patel", "Tanaya Palav"],
};

const UserProfileComponent = () => {
  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="bg-[#1f1f1e] pb-6 flex">
          <div>
            <Avatar className="h-24 w-24 mr-5">
              <AvatarImage src={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="">
            <h1 className="text-xl font-bold">{userProfile.name}</h1>
            <h2 className="text-lg">
              {userProfile.degree} - {userProfile.position}
            </h2>
            <p>{userProfile.location}</p>
          </div>
          <div className="flex gap-1 flex-col ml-20">
            <span>
              Research Interest Score: {userProfile.researchInterestScore}
            </span>
            <span>Citations: {userProfile.citations}</span>
            <span>h-index: {userProfile.hIndex}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Button>Message</Button>
          <Button>Follow</Button>
          <Button className="bg-transparent text-white hover:text-black hover:bg-white">
            More
          </Button>
        </div>

        <div className="flex flex-wrap gap-10">
          <div className="w-2/3">
            <PeopleProfileCard {...userProfile} />
          </div>
          <div className="w-1/4">
            <Card className="bg-[#252525] border-0 ">
              <CardHeader>
                <h3 className="font-semibold text-xl">Top Co-authors</h3>
              </CardHeader>
              <CardContent>
                <ul className="mt-2 list-disc list-inside gap-5">
                  {userProfile.coAuthors.map((item, index) => (
                    <span key={index} className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage />
                        <AvatarFallback className="bg-white text-[#252525] font-bold">
                          {item.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p>{item}</p>
                    </span>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="w-2/3">
            <ResearchWork {...userProfile.activity} />
          </div>

          <div className="w-1/4">
            <Card className="bg-[#252525] border-0 ">
              <CardHeader>
                <h3 className="font-semibold text-xl">Followers</h3>
              </CardHeader>
              <CardContent>
                <ul className="mt-2 list-disc list-inside gap-5">
                  {userProfile.followers.map((item, index) => (
                    <span key={index} className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage />
                        <AvatarFallback className="bg-white text-[#252525] font-bold">
                          {item.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p>{item}</p>
                    </span>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfileComponent;
