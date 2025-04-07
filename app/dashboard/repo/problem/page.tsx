"use client";

import { useState } from "react";
import { FiTrendingUp, FiClock, FiStar, FiPlus } from "react-icons/fi";
import ProblemStatementCard from "./ProblemStatementCard";
import UserInterestsSidebar from "./UserInterestsSidebar";
import Layout from "@/components/Layout";
import { DiscoverTabs } from "../Tabs";
import { Button } from "@/components/ui/button";
import FiltersSection from "./FilterSection";
import AddProblemModal from "./AddProblemModal";

export default function ProblemStatementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Mock data - replace with API calls
  const problemStatements = [
    {
      id: 1,
      title: "AI-based Early Detection of Plant Diseases",
      description:
        "Develop a machine learning model that can identify plant diseases from leaf images with 90%+ accuracy.",
      categories: ["AI/ML", "Agriculture"],
      postedBy: "AgriTech Inc.",
      postedDate: "2023-10-15",
      interestCount: 24,
      isTrending: true,
      isRecent: true,
    },
    {
      id: 2,
      title: "Blockchain Solution for Academic Credential Verification",
      description:
        "Create a decentralized system to prevent certificate forgery and simplify verification processes.",
      categories: ["Blockchain", "Education"],
      postedBy: "CS Department",
      postedDate: "2023-11-02",
      interestCount: 18,
      isTrending: true,
      isRecent: false,
    },
    // Add more problem statements...
  ];

  const filteredProblems = problemStatements.filter((problem) => {
    // Filter by active tab
    if (activeTab === "trending" && !problem.isTrending) return false;
    if (activeTab === "recent" && !problem.isRecent) return false;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      return selectedCategories.some((cat) => problem.categories.includes(cat));
    }

    return true;
  });

  return (
    <Layout>
      <DiscoverTabs />
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            <FiltersSection
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />

            <UserInterestsSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header with tabs */}
            <div className="bg-gray-800 border-gray-700 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Problem Statements</h1>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FiPlus /> Add Problem
                </Button>
              </div>

              <div className="flex border-b">
                <button
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${
                    activeTab === "trending"
                      ? "text-white border-b-2 border-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("trending")}
                >
                  <FiTrendingUp /> Trending
                </button>
                <button
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${
                    activeTab === "recent"
                      ? "text-white border-b-2 border-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("recent")}
                >
                  <FiClock /> Recent
                </button>
                <button
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${
                    activeTab === "all"
                      ? "text-white border-b-2 border-white"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  <FiStar /> All Problems
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <ProblemStatementCard
                    key={problem.id}
                    problem={problem}
                    onInterestToggle={() => console.log("Interest toggled")}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">
                    No problems match your filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AddProblemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </Layout>
  );
}
