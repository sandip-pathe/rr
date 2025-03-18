"use client";

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import EditMainUserComponent from "./EditMainUserComponent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PeopleProfileCard from "./UserProfile";
import ResearchWork from "./ResearchWork";
import AddResearch from "./AddResearch";
import { getDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import { usePageHeading } from "@/app/auth/PageHeadingContext";

interface UserProfile {
  name: string;
  email: string;
  degree: string;
  role: string;
  position: string;
  institution: string;
  location: string;
  photoURL: string;
  introduction: string;
  desciplines: string[];
  skills: string[];
  coAuthors: string[];
  followers: string[];
  uid: string;
}

const UserProfileComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { setHeading, setIsVisible } = usePageHeading();

  useEffect(() => {
    if (!headingRef.current) return;
    setHeading(headingRef.current.innerText);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(headingRef.current);
    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, [setHeading, setIsVisible]);

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          console.warn("User profile not found!");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (isLoading) return <div className="text-center p-10">Loading...</div>;

  if (!userProfile) return <div className="text-center p-10"></div>;

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
              <AvatarImage src={userProfile.photoURL} />
              <AvatarFallback className="text-7xl font-black text-gray-500">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="">
            <div className="flex flex-wrap gap-5 items-center">
              <h1 ref={headingRef} className="text-xl font-bold">
                {userProfile.name}
              </h1>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-fit w-fit px-2 py-0 bg-transparent rounded-none hover:bg-slate-700 text-white underline-offset-1 underline"
              >
                Edit
              </Button>
            </div>
            <p>{userProfile.position}</p>
            <h2 className="text-lg">
              {userProfile.degree} - {userProfile.institution}
            </h2>
            <p>{userProfile.location}</p>
          </div>
          <div className="flex gap-1 flex-col mr-20 ml-auto">
            <span>Research Interest Score: {"3"}</span>
            <span>Citations: {"6"}</span>
            <span>h-index: {"7"}</span>
          </div>
        </div>

        {/*Edit Profile Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
            <EditMainUserComponent onClose={() => setIsModalOpen(false)} />
          </div>
        </Modal>

        <Modal isOpen={isModal2Open} onClose={() => setIsModal2Open(false)}>
          <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
            <AddResearch onClick={() => setIsModal2Open(false)} />
          </div>
        </Modal>

        {/*Buttons */}
        <div className="flex flex-wrap items-end justify-center gap-5 mb-10 mr-10">
          <Button
            className="text-md font-semibold"
            onClick={() => setIsModal2Open(true)}
          >
            Add Work
          </Button>
          <Button className="bg-transparent text-white hover:text-black hover:bg-white">
            More
          </Button>
        </div>

        {/*User Profile Component */}
        <div className="flex flex-wrap gap-10">
          <div className="w-2/3">
            <PeopleProfileCard {...userProfile} />
          </div>

          {/*Top Co-authors */}
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

          {/*Research Work */}
          <div className="w-2/3">
            {user && <ResearchWork userId={userProfile.uid} />}
          </div>

          {/*Followers */}
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
