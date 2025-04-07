"use client";

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { getDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface UserProfile {
  name: string;
  email?: string;
  degree: string | undefined;
  role: string;
  position?: string;
  institution?: string;
  location?: string;
  photoURL?: string;
  introduction?: string;
  desciplines?: string[];
  skills?: string[];
  coAuthors?: string[];
  followers?: string[];
  following?: string[];
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
    collaborators?: string[];
    link?: string;
  }[];
  startupProjects?: {
    name: string;
    description: string;
    foundedYear: string;
    website?: string;
    status?: "active" | "inactive" | "acquired";
  }[];
}

const PublicUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFollowing, setIsFollowing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const userId = `rPnx65wC5KOaj9hfAlargR3vP4L2`;

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setUserProfile({
            ...data,
            // Initialize arrays if they don't exist
            desciplines: data.desciplines || [],
            skills: data.skills || [],
            coAuthors: data.coAuthors || [],
            followers: data.followers || [],
            following: data.following || [],
            academicProjects: data.academicProjects || [],
            startupProjects: data.startupProjects || [],
            socialLinks: data.socialLinks || {},
          });
        } else {
          setError("User profile not found");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!userProfile) {
    return <div className="text-center p-10">Profile not found</div>;
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement actual follow functionality
  };

  // Safe data access helpers
  const getSocialLink = (
    platform: keyof NonNullable<UserProfile["socialLinks"]>
  ) => {
    return userProfile.socialLinks?.[platform] || null;
  };

  const hasSocialLinks = () => {
    return !!(
      getSocialLink("website") ||
      getSocialLink("linkedin") ||
      getSocialLink("github") ||
      getSocialLink("twitter") ||
      userProfile.email
    );
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#1f1f1e] to-[#2a2a28] rounded-lg p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 border-4 border-white/10">
              <AvatarImage src={userProfile.photoURL} />
              <AvatarFallback className="text-7xl font-black text-gray-500 bg-white/10">
                {userProfile.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-grow">
            <div className="flex flex-wrap gap-4 items-center">
              <h1 ref={headingRef} className="text-2xl md:text-3xl font-bold">
                {userProfile.name || "Unknown User"}
              </h1>
              {userProfile.role && (
                <Badge variant="secondary" className="text-sm">
                  {userProfile.role}
                </Badge>
              )}
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className="h-fit px-3 py-1"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>

            {(userProfile.position || userProfile.institution) && (
              <p className="text-lg flex items-center gap-2 mt-1">
                <FaGraduationCap className="text-primary" />
                {[userProfile.position, userProfile.institution]
                  .filter(Boolean)
                  .join(" at ")}
              </p>
            )}

            {userProfile.location && (
              <div className="flex items-center gap-2 mt-1">
                <FiGlobe />
                <p>{userProfile.location}</p>
              </div>
            )}

            {/* Social Links */}
            {hasSocialLinks() && (
              <div className="flex gap-3 mt-3">
                {getSocialLink("linkedin") && (
                  <a
                    href={getSocialLink("linkedin")!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiLinkedin className="text-xl hover:text-blue-400 transition" />
                  </a>
                )}
                {getSocialLink("github") && (
                  <a
                    href={getSocialLink("github")!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiGithub className="text-xl hover:text-purple-400 transition" />
                  </a>
                )}
                {getSocialLink("twitter") && (
                  <a
                    href={getSocialLink("twitter")!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiTwitter className="text-xl hover:text-blue-400 transition" />
                  </a>
                )}
                {getSocialLink("website") && (
                  <a
                    href={getSocialLink("website")!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink className="text-xl hover:text-green-400 transition" />
                  </a>
                )}
                {userProfile.email && (
                  <a href={`mailto:${userProfile.email}`}>
                    <FiMail className="text-xl hover:text-red-400 transition" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-lg min-w-[200px]">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {userProfile.followers?.length || 0}
                </p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userProfile.following?.length || 0}
                </p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userProfile.coAuthors?.length || 0}
                </p>
                <p className="text-xs text-gray-400">Collaborators</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-xl font-bold">42</p>
                <p className="text-xs text-gray-400">Citations</p>
              </div>
              <div>
                <p className="text-xl font-bold">12</p>
                <p className="text-xs text-gray-400">h-index</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 h-12 bg-[#252525]">
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
                        userProfile.coAuthors.length > 0 ? (
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
                                        {author?.charAt(0) || "C"}
                                      </AvatarFallback>
                                    </Avatar>
                                    {author || "Unknown Collaborator"}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">
                            No collaboration information available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card className="bg-[#252525] border-0">
                    <CardHeader>
                      <CardTitle>Research Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">
                            Research Productivity
                          </p>
                          <Progress value={75} className="h-2 mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-2xl font-bold">24</p>
                            <p className="text-xs text-gray-400">
                              Publications
                            </p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-2xl font-bold">56</p>
                            <p className="text-xs text-gray-400">Citations</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-2xl font-bold">12</p>
                            <p className="text-xs text-gray-400">h-index</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-2xl font-bold">8</p>
                            <p className="text-xs text-gray-400">i10-index</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  {userProfile.skills && userProfile.skills.length > 0 && (
                    <Card className="bg-[#252525] border-0">
                      <CardHeader>
                        <CardTitle>Skills & Expertise</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ResearchWork userId={userId} />
                </div>

                <div className="space-y-6">
                  {/* Research Stats */}
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
                  {userProfile.coAuthors &&
                    userProfile.coAuthors.length > 0 && (
                      <Card className="bg-[#252525] border-0">
                        <CardHeader>
                          <CardTitle>Top Collaborators</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {userProfile.coAuthors
                              .slice(0, 5)
                              .map((author, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3"
                                >
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {author?.charAt(0) || "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {author || "Unknown Collaborator"}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      5 joint publications
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                        {userProfile.coAuthors.length > 5 && (
                          <CardFooter>
                            <Button variant="ghost" className="w-full">
                              View All Collaborators
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    )}
                </div>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProfile.academicProjects &&
                userProfile.academicProjects.length > 0 ? (
                  userProfile.academicProjects.map((project, index) => (
                    <Card
                      key={index}
                      className="bg-[#252525] border-0 hover:bg-[#2e2e2d] transition"
                    >
                      <CardHeader>
                        <CardTitle>
                          {project.title || "Untitled Project"}
                        </CardTitle>
                        {project.year && (
                          <CardDescription>{project.year}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {project.description ? (
                          <p className="text-sm line-clamp-3">
                            {project.description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No description provided
                          </p>
                        )}
                        {project.collaborators &&
                          project.collaborators.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-400 mb-1">
                                Collaborators
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {project.collaborators
                                  .slice(0, 3)
                                  .map((collab, i) => (
                                    <Badge key={i} variant="outline">
                                      {collab || "Unknown"}
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
                      {project.link && (
                        <CardFooter>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="gap-2">
                              <FiExternalLink size={14} /> View Project
                            </Button>
                          </a>
                        </CardFooter>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full bg-[#252525] border-0">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <FaChalkboardTeacher className="text-4xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No Academic Projects
                      </h3>
                      <p className="text-gray-400">
                        This user hasn't added any academic projects yet
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Startups Tab */}
            <TabsContent value="startups" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProfile.startupProjects &&
                userProfile.startupProjects.length > 0 ? (
                  userProfile.startupProjects.map((startup, index) => (
                    <Card
                      key={index}
                      className="bg-[#252525] border-0 hover:bg-[#2e2e2d] transition"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>
                              {startup.name || "Unnamed Venture"}
                            </CardTitle>
                            {startup.foundedYear && (
                              <CardDescription>
                                Founded in {startup.foundedYear}
                              </CardDescription>
                            )}
                          </div>
                          {startup.status && (
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
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {startup.description ? (
                          <p className="text-sm">{startup.description}</p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No description provided
                          </p>
                        )}
                      </CardContent>
                      {startup.website && (
                        <CardFooter>
                          <a
                            href={startup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="gap-2">
                              <FiExternalLink size={14} /> Visit Website
                            </Button>
                          </a>
                        </CardFooter>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full bg-[#252525] border-0">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <MdBusinessCenter className="text-4xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No Startup Ventures
                      </h3>
                      <p className="text-gray-400">
                        This user hasn't added any startup ventures yet
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PublicUserProfile;
