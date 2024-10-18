"use client";

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import EditMainUserComponent from "./EditMainUserComponent";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import PeopleProfileCard from "./UserProfile";
import ResearchWork from "./ResearchWork";
import AddResearch from "./AddResearch";
import Header from "@/components/Header";

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
  name: "Sandip Pathe",
  degree: "Bachelor of Engineering",
  position: "Student at Vidyalankar Institute of Technology",
  institution: "Vidyalankar Institute of Technology",
  location: "Mumbai, India",
  researchInterestScore: 3.4,
  citations: 4,
  hIndex: 1,
  introduction: "React, Django, Python, Machine learning",
  disciplines: ["Electronic Engineering"],
  skills: [
    "Python",
    "Typescript",
    "React",
    "Machine Learning",
    "Polsar Data Processing",
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
    "Akhil Masurkar",
    "Lathish Rai",
    "Varsha Turkar",
    "Aarya Mohite",
    "Soham Karulkar",
    "Sagar Shinde",
  ],
  followers: ["Lathish Rai", "Javed Patel", "Tanaya Palav"],
};

const UserProfileComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);

  const openModal2 = () => {
    setIsModal2Open(true);
  };

  const closeModal2 = () => {
    setIsModal2Open(false);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <Layout>
      <div className="p-8">
        <div className="bg-[#1f1f1e] pb-6 flex">
          <div>
            <Avatar
              onClick={() => {
                alert("Edit Avatar");
              }}
              className="h-24 w-24 mr-5 cursor-pointer"
            >
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-7xl font-black text-gray-500">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="">
            <div className="flex flex-wrap gap-5 items-center">
              <h1 className="text-xl font-bold">{userProfile.name}</h1>
              <Button
                onClick={openModal}
                className="h-fit w-fit px-2 py-0 bg-transparent rounded-none hover:bg-slate-700 text-white underline-offset-1 underline"
              >
                Edit
              </Button>
            </div>
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
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="bg-black w-2/3 m-auto mt-12 ">
            <EditMainUserComponent />
            <Button
              onClick={closeModal}
              className="ml-6 mb-6 bg-transparent text-white p-2 hover:bg-dark-300"
            >
              Cancel
            </Button>
          </div>
        </Modal>
        <Modal isOpen={isModal2Open} onClose={closeModal2}>
          <div className="bg-black w-2/3 m-auto mt-12 ">
            <AddResearch />
            <Button
              onClick={closeModal2}
              className="ml-6 mb-6 bg-transparent text-white p-2 hover:bg-dark-300"
            >
              Cancel
            </Button>
          </div>
        </Modal>
        <div className="flex flex-wrap items-end justify-center gap-5 mb-10 mr-10">
          <Button className="text-md font-semibold" onClick={openModal2}>
            Add Research
          </Button>
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
