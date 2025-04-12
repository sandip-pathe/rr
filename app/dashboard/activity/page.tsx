"use client";

import {
  Bookmark,
  Lightbulb,
  Megaphone,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  FileText,
  Video,
} from "lucide-react";
import { PiPersonFill } from "react-icons/pi";
import { TbBrandFeedly } from "react-icons/tb";
import { LuHandHeart } from "react-icons/lu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function InnovationDashboard() {
  const trendingProjects = [
    { title: "AI for Wildlife Conservation", views: 124, match: 92 },
    { title: "Blockchain Voting System", views: 98, match: 85 },
    { title: "AR Campus Navigation", views: 76, match: 78 },
  ];

  const recommendedInternships = [
    { title: "ML Research Intern @TechLab", deadline: "May 15", match: 95 },
    { title: "Sustainability Hackathon", deadline: "April 30", match: 88 },
    { title: "Robotics Team Member", deadline: "Ongoing", match: 82 },
  ];

  const problemSpotlight = {
    title: "Reducing Food Waste in Campus Cafeterias",
    description:
      "Design a system to track and reduce food waste by 50% using IoT and data analytics",
    tags: ["Sustainability", "IoT", "Data Science"],
  };

  const researchDigest = [
    {
      author: "Dr. Smith",
      title: "Neural Networks for Climate Modeling",
      summary: "New approach to predict extreme weather events",
    },
    {
      author: "CS Dept",
      title: "Quantum Computing Workshop",
      summary: "Hands-on session for beginners on May 5th",
    },
  ];

  const innovationTip =
    "When brainstorming, quantity leads to quality. Generate 20 ideas quickly, then refine the top 3.";

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-[#252525]">
          <TabsTrigger value="for-you" className="flex items-center gap-2">
            <PiPersonFill />
            For You
          </TabsTrigger>
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <TbBrandFeedly />
            Feed
          </TabsTrigger>
          <TabsTrigger value="research" className="flex items-center gap-2">
            <LuHandHeart />
            Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Projects */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold">Top Projects</h2>
              </div>
              <div className="space-y-3">
                {trendingProjects.map((project, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{project.title}</h3>
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                        {project.views} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem Spotlight */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <AlertCircle className="text-purple-400 mr-2" />
                <h2 className="text-lg font-semibold">Problem Spotlight</h2>
              </div>
              <div className="p-3 bg-gray-700 rounded">
                <h3 className="font-medium">{problemSpotlight.title}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  {problemSpotlight.description}
                </p>
                <div className="flex flex-wrap mt-2 gap-1">
                  {problemSpotlight.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="mt-3 text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded transition">
                  View Details
                </button>
              </div>
            </div>

            {/* Research Digest */}
            <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
              <div className="flex items-center mb-3">
                <FileText className="text-red-400 mr-2" />
                <h2 className="text-lg font-semibold">Research Digest</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchDigest.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <p className="text-xs text-gray-400">{item.author}</p>
                    <h3 className="font-medium mt-1">{item.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{item.summary}</p>
                    <button className="mt-2 text-sm text-red-400 hover:text-red-300 transition">
                      Read more →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* For You Tab Content */}
        <TabsContent value="for-you" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Projects for You */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold">Top Projects For You</h2>
              </div>
              <div className="space-y-3">
                {trendingProjects.map((project, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{project.title}</h3>
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                        {project.match}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {project.views} views this week
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities For You */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <GraduationCap className="text-green-400 mr-2" />
                <h2 className="text-lg font-semibold">Opportunities For You</h2>
              </div>
              <div className="space-y-3">
                {recommendedInternships.map((opp, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{opp.title}</h3>
                      <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                        {opp.match}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Apply by {opp.deadline}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition">
                  <Megaphone className="text-blue-400 mb-1" />
                  <span className="text-sm">Post Idea</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition">
                  <Bookmark className="text-green-400 mb-1" />
                  <span className="text-sm">Save Project</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition">
                  <Video className="text-purple-400 mb-1" />
                  <span className="text-sm">Watch Demo</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition">
                  <GraduationCap className="text-red-400 mb-1" />
                  <span className="text-sm">Find Mentor</span>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Research Tab Content */}
        <TabsContent value="research" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Research Digest Expanded */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <FileText className="text-red-400 mr-2" />
                <h2 className="text-lg font-semibold">Latest Research</h2>
              </div>
              <div className="space-y-4">
                {researchDigest.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.author}</p>
                    <p className="text-sm text-gray-300 mt-2">{item.summary}</p>
                    <div className="flex justify-between items-center mt-3">
                      <button className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">
                        Read Full Paper
                      </button>
                      <span className="text-xs text-gray-400">2 days ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Innovation Tip */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Lightbulb className="text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold">Innovation Tip</h2>
              </div>
              <div className="p-4 bg-yellow-900 bg-opacity-20 rounded border border-yellow-800">
                <p className="italic">"{innovationTip}"</p>
                <p className="text-xs text-gray-400 mt-2">
                  — Innovation Lab Team
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
