"use client";

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import EditMainUserComponent from "./EditMainUserComponent";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import PeopleProfileCard from "./UserProfile";
import ResearchWork from "./ResearchWork";
import AddResearch from "./AddResearch";
import { getDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import { usePageHeading } from "@/app/auth/PageHeadingContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const UserProfileComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (!userProfile)
    return <div className="text-center p-10">Profile not found</div>;

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Profile Header */}
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
              <h1 ref={headingRef} className="text-2xl md:text-3xl font-bold">
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
                          <p className="text-xs text-gray-400">{stat.label}</p>
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
                      { value: userProfile.citations || 0, label: "Citations" },
                      { value: userProfile.patents || 0, label: "Patents" },
                    ]
                      .filter((stat) => stat.value > 0) // Only show non-zero
                      .sort((a, b) => b.value - a.value) // Sort by highest value
                      .slice(0, 3) // Take top 3
                      .map((stat, index) => (
                        <div key={index}>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-gray-400">{stat.label}</p>
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
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 h-12 bg-[#252525]">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FiGlobe /> Overview
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-2">
                <MdScience /> Research
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FaChalkboardTeacher /> Projects
              </TabsTrigger>
              <TabsTrigger value="startups" className="flex items-center gap-2">
                <MdBusinessCenter /> Startups
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
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
                          <h4 className="font-medium mb-2">Recent Activity</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <MdScience className="text-primary" />
                              </div>
                              <div>
                                <p>
                                  Published new research paper: "AI in Medicine"
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
                                  Joined new project: "Quantum Computing
                                  Research"
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

            {/* Research Tab */}
            <TabsContent value="research" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MdScience /> Research Works
                </h2>
                <Button onClick={() => setIsModal2Open(true)} className="gap-2">
                  <MdScience size={18} /> Add Research
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {user && <ResearchWork userId={userProfile.uid} />}
                </div>

                {/* Right Column for Research Statistics and Collaborators */}
                <div className="space-y-6">
                  <Card className="bg-[#252525] border-0">
                    <CardHeader>
                      <CardTitle>Research Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Citations Growth
                          </p>
                          <div className="h-[150px] bg-white/5 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">
                              Chart would display here
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-xl font-bold">42</p>
                            <p className="text-xs text-gray-400">
                              Total Citations
                            </p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-xl font-bold">12</p>
                            <p className="text-xs text-gray-400">h-index</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-xl font-bold">8</p>
                            <p className="text-xs text-gray-400">i10-index</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-xl font-bold">24</p>
                            <p className="text-xs text-gray-400">
                              Publications
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Collaborators */}
                  <Card className="bg-[#252525] border-0">
                    <CardHeader>
                      <CardTitle>Top Collaborators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userProfile.coAuthors &&
                        userProfile.coAuthors.length > 0 ? (
                          userProfile.coAuthors.map((author, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {author?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{author}</p>
                                <p className="text-sm text-gray-400">
                                  5 joint publications
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400">No collaborators yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaChalkboardTeacher /> Academic Projects
                </h2>
                <Button className="gap-2">
                  <FaChalkboardTeacher size={18} /> Add Project
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProfile.academicProjects &&
                (userProfile.academicProjects ?? []).length > 0 ? (
                  (userProfile.academicProjects ?? []).map((project, index) => (
                    <Card
                      key={index}
                      className="bg-[#252525] border-0 hover:bg-[#2e2e2d] transition"
                    >
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.year}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-3">
                          {project.description}
                        </p>
                        {project.collaborators.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-400 mb-1">
                              Collaborators
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.collaborators
                                .slice(0, 3)
                                .map((collab, i) => (
                                  <Badge key={i} variant="outline">
                                    {collab}
                                  </Badge>
                                ))}
                              {project.collaborators.length > 3 && (
                                <Badge variant="outline">
                                  +{project.collaborators.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="gap-2">
                              <FiExternalLink size={14} /> View Project
                            </Button>
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full bg-[#252525] border-0">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <FaChalkboardTeacher className="text-4xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No Projects Yet
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Add your academic projects to showcase your work and
                        collaborations
                      </p>
                      <Button
                        className="gap-2"
                        onClick={() => setIsModal2Open(true)}
                      >
                        <FaChalkboardTeacher size={18} /> Add Your First Project
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Startups Tab */}
            <TabsContent value="startups" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MdBusinessCenter /> Startup Ventures
                </h2>
                <Button className="gap-2">
                  <MdBusinessCenter size={18} /> Add Startup
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProfile.startupProjects &&
                (userProfile.startupProjects ?? []).length > 0 ? (
                  (userProfile.startupProjects ?? []).map((startup, index) => (
                    <Card
                      key={index}
                      className="bg-[#252525] border-0 hover:bg-[#2e2e2d] transition"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{startup.name}</CardTitle>
                            <CardDescription>
                              Founded in {startup.foundedYear}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              startup.status === "active"
                                ? "default"
                                : startup.status === "inactive"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {startup.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{startup.description}</p>
                      </CardContent>
                      <CardFooter>
                        {startup.website && (
                          <a
                            href={startup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="gap-2">
                              <FiExternalLink size={14} /> Visit Website
                            </Button>
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full bg-[#252525] border-0">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <MdBusinessCenter className="text-4xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No Startup Ventures Yet
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Add your startup projects to showcase your
                        entrepreneurial work
                      </p>
                      <Button className="gap-2">
                        <MdBusinessCenter size={18} /> Add Your First Startup
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-[#252525] border-0">
                    <CardHeader>
                      <CardTitle>University Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-3">Privacy Settings</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p>Profile Visibility</p>
                                <p className="text-sm text-gray-400">
                                  Control who can see your profile
                                </p>
                              </div>
                              <select
                                defaultValue={
                                  userProfile.universitySettings?.privacy ||
                                  "public"
                                }
                                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm"
                              >
                                <option value="public">Public</option>
                                <option value="university-only">
                                  University Only
                                </option>
                                <option value="private">Private</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p>Research Visibility</p>
                                <p className="text-sm text-gray-400">
                                  Control who can see your research works
                                </p>
                              </div>
                              <select
                                defaultValue={
                                  userProfile.universitySettings?.privacy ||
                                  "public"
                                }
                                className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm"
                              >
                                <option value="public">Public</option>
                                <option value="university-only">
                                  University Only
                                </option>
                                <option value="private">Private</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div>
                          <h3 className="font-medium mb-3">
                            Notification Preferences
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="emailNotifications"
                                defaultChecked={
                                  userProfile.universitySettings
                                    ?.notifications ?? true
                                }
                                className="h-4 w-4 rounded border-white/10 bg-white/5 focus:ring-primary"
                              />
                              <label htmlFor="emailNotifications">
                                Email Notifications
                              </label>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="researchUpdates"
                                defaultChecked={true}
                                className="h-4 w-4 rounded border-white/10 bg-white/5 focus:ring-primary"
                              />
                              <label htmlFor="researchUpdates">
                                Research Updates
                              </label>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="collaborationRequests"
                                defaultChecked={true}
                                className="h-4 w-4 rounded border-white/10 bg-white/5 focus:ring-primary"
                              />
                              <label htmlFor="collaborationRequests">
                                Collaboration Requests
                              </label>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div>
                          <h3 className="font-medium mb-3">Appearance</h3>
                          <div className="flex gap-4">
                            <button
                              disabled
                              className={`p-2 rounded-md border disabled:opacity-50 ${
                                userProfile.universitySettings?.theme ===
                                "light"
                                  ? "border-primary bg-primary/10"
                                  : "border-white/10"
                              }`}
                            >
                              Light
                            </button>
                            <button
                              className={`p-2 rounded-md border ${
                                userProfile.universitySettings?.theme === "dark"
                                  ? "border-primary bg-primary/10"
                                  : "border-white/10"
                              }`}
                            >
                              Dark
                            </button>
                            <button
                              className={`p-2 rounded-md border ${
                                userProfile.universitySettings?.theme ===
                                "system"
                                  ? "border-primary bg-primary/10"
                                  : "border-white/10"
                              }`}
                            >
                              System
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Save Settings</Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Account Security */}
                  <Card className="bg-[#252525] border-0">
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Email Address
                          </p>
                          <div className="flex items-center justify-between">
                            <p>{userProfile.email}</p>
                            <Button variant="ghost" size="sm">
                              Change
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Password</p>
                          <div className="flex items-center justify-between">
                            <p>••••••••</p>
                            <Button variant="ghost" size="sm">
                              Change
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Two-Factor Authentication
                          </p>
                          <div className="flex items-center justify-between">
                            <p>Not enabled</p>
                            <Button variant="ghost" size="sm">
                              Enable
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="bg-[#252525] border-0 border-red-500/20">
                    <CardHeader>
                      <CardTitle className="text-red-500">
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-1">Deactivate Account</p>
                          <p className="text-sm text-gray-400 mb-2">
                            Temporarily deactivate your account
                          </p>
                          <Button
                            variant="outline"
                            className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                          >
                            Deactivate
                          </Button>
                        </div>
                        <Separator className="bg-red-500/20" />
                        <div>
                          <p className="font-medium mb-1">Delete Account</p>
                          <p className="text-sm text-gray-400 mb-2">
                            Permanently delete your account and all data
                          </p>
                          <Button
                            variant="outline"
                            className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfileComponent;
