"use client";

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import EditMainUserComponent from "./EditMainUserComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PeopleProfileCard from "./UserProfile";
import AddResearch from "./AddResearch";
import { getDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FiExternalLink,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMail,
  FiGlobe,
} from "react-icons/fi";
import {
  FaUniversity,
  FaGraduationCap,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { MdScience, MdBusinessCenter } from "react-icons/md";
import ProfileStats from "./Stats";
import { useSearchParams } from "next/navigation";
import { ResearchTab } from "./ResearchTab";
import { SettingsTab } from "./SettingsTab";
import { StartupsTab } from "./StartupTab";
import { ProjectsTab } from "./ProjectTab";
import { Suspense } from "react";
import Spiner from "@/components/Spiner";

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
  following: string[];
  uid: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  academicProjects?: {
    title: string;
    description: string;
    year: string;
    collaborators: string[];
    link?: string;
  }[];
  researchPapers?: {
    title: string;
    description: string;
    year: string;
    collaborators: string[];
    link?: string;
  }[];
  startupProjects?: {
    name: string;
    description: string;
    foundedYear: string;
    website?: string;
    status: "active" | "inactive" | "acquired";
  }[];
  universitySettings?: {
    notifications: boolean;
    privacy: "public" | "private" | "university-only";
    theme: "light" | "dark" | "system";
  };
  certifications?: string[];
  teachingExperienceYears?: number;
  papersPublished?: number;
  studentsGuided?: number;
  grantsAwarded?: number;
  citations?: number;
  patents?: number;
  researchInterests?: string[];
}

type FilterType =
  | "overview"
  | "research"
  | "projects"
  | "startups"
  | "settings";

const UserProfileComponent = () => {
  const searchParams = useSearchParams();
  const defaultTab = searchParams?.get("tab") || "overview";
  console.log("Default Tab:", defaultTab);
  const [activeTab, setActiveTab] = useState<FilterType>(
    defaultTab as FilterType
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          data.socialLinks = data.socialLinks || {};
          data.academicProjects = data.academicProjects || [];
          data.startupProjects = data.startupProjects || [];
          data.universitySettings = data.universitySettings || {
            notifications: true,
            privacy: "public",
            theme: "system",
          };
          setUserProfile(data);
          console.log("User profile data:", data);
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

  if (isLoading || !userProfile)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (!userProfile)
    return <div className="text-center p-10">Profile not found</div>;

  return (
    <Layout>
      <Suspense fallback={<Spiner />}>
        <div className="p-4 md:p-8">
          <div className="bg-gradient-to-r from-[#1f1f1e] to-[#2a2a28] rounded-lg p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar
                onClick={() => setIsModalOpen(true)}
                className="h-32 w-32 cursor-pointer border-4 border-white/10 hover:border-primary transition-all"
              >
                <AvatarImage src={userProfile.photoURL} />
                <AvatarFallback className="text-7xl font-black text-gray-500 bg-white/10">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-grow">
              <div className="flex flex-wrap gap-4 items-center">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {userProfile.name}
                </h1>
                {userProfile.role && (
                  <Badge variant="secondary" className="text-sm">
                    {userProfile.role}
                  </Badge>
                )}
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="ghost"
                  className="h-fit px-3 py-1 rounded-md hover:bg-white/10 text-white bg-black"
                >
                  Edit Profile
                </Button>
              </div>

              <p className="text-lg flex items-center gap-2 mt-1">
                <FaGraduationCap className="text-primary" />
                {userProfile.position} at {userProfile.institution}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <FiGlobe />
                <p>{userProfile.location}</p>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-3">
                {userProfile.socialLinks?.linkedin && (
                  <a
                    href={userProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiLinkedin className="text-xl hover:text-blue-400 transition" />
                  </a>
                )}
                {userProfile.socialLinks?.github && (
                  <a
                    href={userProfile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiGithub className="text-xl hover:text-purple-400 transition" />
                  </a>
                )}
                {userProfile.socialLinks?.twitter && (
                  <a
                    href={userProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiTwitter className="text-xl hover:text-blue-400 transition" />
                  </a>
                )}
                {userProfile.socialLinks?.website && (
                  <a
                    href={userProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink className="text-xl hover:text-green-400 transition" />
                  </a>
                )}
                <a
                  href={`mailto:${userProfile.email}`}
                  className="flex items-center gap-2 flex-row"
                >
                  <FiMail className="text-xl hover:text-red-400 transition" />
                  <p>{userProfile.email}</p>
                </a>
              </div>
            </div>

            {/* Role-Specific Stats */}
            <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-lg min-w-[200px]">
              {userProfile.role === "student" ? (
                // Student Stats
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Top Achievements</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        {
                          value: userProfile.academicProjects?.length || 0,
                          label: "Projects",
                        },
                        {
                          value: userProfile.researchPapers?.length || 0,
                          label: "Papers",
                        },
                        {
                          value: userProfile.certifications?.length || 0,
                          label: "Certifications",
                        },
                      ]
                        .sort((a, b) => b.value - a.value) // Sort by highest value
                        .slice(0, 3) // Take top 3
                        .map((stat, index) => (
                          <div key={index}>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-gray-400">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                  {userProfile.skills?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400">Top Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userProfile.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Key Metrics</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        {
                          value: userProfile.teachingExperienceYears || 0,
                          label: "Years Teaching",
                        },
                        {
                          value: userProfile.papersPublished || 0,
                          label: "Papers",
                        },
                        {
                          value: userProfile.studentsGuided || 0,
                          label: "Students",
                        },
                        {
                          value: userProfile.grantsAwarded || 0,
                          label: "Grants",
                        },
                        {
                          value: userProfile.citations || 0,
                          label: "Citations",
                        },
                        { value: userProfile.patents || 0, label: "Patents" },
                      ]
                        .filter((stat) => stat.value > 0) // Only show non-zero
                        .sort((a, b) => b.value - a.value) // Sort by highest value
                        .slice(0, 3) // Take top 3
                        .map((stat, index) => (
                          <div key={index}>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-gray-400">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Edit Profile Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
              <EditMainUserComponent onClose={() => setIsModalOpen(false)} />
            </div>
          </Modal>

          {/* Add Research Modal */}
          <Modal isOpen={isModal2Open} onClose={() => setIsModal2Open(false)}>
            <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
              <AddResearch onClick={() => setIsModal2Open(false)} />
            </div>
          </Modal>

          {/* Main Content */}
          <div className="mt-8">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as FilterType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 h-12 bg-[#252525]">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <FiGlobe /> Overview
                </TabsTrigger>
                <TabsTrigger
                  value="research"
                  className="flex items-center gap-2"
                >
                  <MdScience /> Research
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-2"
                >
                  <FaChalkboardTeacher /> Projects
                </TabsTrigger>
                <TabsTrigger
                  value="startups"
                  className="flex items-center gap-2"
                >
                  <MdBusinessCenter /> Startups
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <FaUniversity /> Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <PeopleProfileCard {...userProfile} />

                    {/* Research Highlights */}
                    <Card className="bg-[#252525] border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MdScience className="text-primary" />
                          Research Highlights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {userProfile.coAuthors &&
                            userProfile.coAuthors.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">
                                  Top Collaborations
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                  {userProfile.coAuthors
                                    .slice(0, 5)
                                    .map((author, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                      >
                                        <Avatar className="w-6 h-6">
                                          <AvatarFallback className="bg-primary/10 text-primary">
                                            {author?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        {author}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}

                          <div>
                            <h4 className="font-medium mb-2">
                              Recent Activity
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                  <MdScience className="text-primary" />
                                </div>
                                <div>
                                  <p>
                                    Published new research paper AI in Medicine
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    3 days ago
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="bg-green-500/10 p-2 rounded-full">
                                  <FaUniversity className="text-green-500" />
                                </div>
                                <div>
                                  <p>
                                    Joined new project: Quantum Computing
                                    Research
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    1 week ago
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <ProfileStats
                      role="professor"
                      initialData={{
                        projects: 5,
                        cgpa: 8.7,
                        achievements: "Won university hackathon 2023",
                      }}
                      onSave={(data) => console.log("Saved:", data)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="research" className="mt-6">
                <ResearchTab
                  userId={userProfile.uid}
                  onAddResearch={() => setIsModal2Open(true)}
                  coAuthors={userProfile.coAuthors}
                />
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                <ProjectsTab onAddProject={() => setIsModal2Open(true)} />
              </TabsContent>

              <TabsContent value="startups" className="mt-6">
                <StartupsTab
                  startupProjects={userProfile.startupProjects || []}
                  onAddStartup={() => setIsModal2Open(true)}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <SettingsTab
                  email={userProfile.email}
                  universitySettings={userProfile.universitySettings}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Suspense>
    </Layout>
  );
};

export default UserProfileComponent;
