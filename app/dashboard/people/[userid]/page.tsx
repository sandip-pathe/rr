"use client";

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ResearchWork from "./ResearchWork";
import { getDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import PeopleProfileCard from "./UserProfile";
import { usePathname } from "next/navigation";

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  // const profileId = pathname.split("/").pop() as string;
  const profileId = "NrfPWvY4LAZhdrWjH529ei989nN2";
  const { user, name } = useAuth();

  useEffect(() => {
    if (!profileId) return;

    setIsLoading(true);

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", profileId));
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
      <div className="p-8 space-y-6">
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
              <h1 className="text-xl font-bold">{userProfile.name}</h1>
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

        <div className="flex flex-wrap gap-5">
          <Button>Message</Button>
          <Button>Follow</Button>
          <Button className="bg-transparent text-white hover:text-black hover:bg-white">
            More
          </Button>
        </div>

        <div className="flex flex-wrap gap-10">
          {/*User Profile Component */}
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
            {profileId && <ResearchWork userId={profileId} />}
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
