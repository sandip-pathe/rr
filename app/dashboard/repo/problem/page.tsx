"use client";

import { useState, useEffect } from "react";
import { FiTrendingUp, FiClock, FiStar, FiPlus } from "react-icons/fi";
import ProblemStatementCard from "./ProblemStatementCard";
import UserInterestsSidebar from "./UserInterestsSidebar";
import Layout from "@/components/Layout";
import { DiscoverTabs } from "../Tabs";
import { Button } from "@/components/ui/button";
import FiltersSection from "./FilterSection";
import AddProblemModal from "./AddProblemModal";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Problem, ProblemFormData } from "@/types/problem";
import { useAuth } from "@/app/auth/AuthContext";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Modal from "@/components/Modal";

export default function ProblemStatementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trending" | "recent" | "all">(
    "all"
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, name } = useAuth();

  const db = FIREBASE_DB;

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const problemsRef = collection(db, "problems");
        let q;

        if (activeTab === "trending") {
          q = query(
            problemsRef,
            where("interestCount", ">=", 10), // Consider problems with 10+ interests as trending
            orderBy("interestCount", "desc"),
            limit(20)
          );
        } else if (activeTab === "recent") {
          q = query(problemsRef, orderBy("createdAt", "desc"), limit(20));
        } else {
          q = query(problemsRef, orderBy("createdAt", "desc"));
        }

        const querySnapshot = await getDocs(q);
        const problemsData: Problem[] = [];
        querySnapshot.forEach((doc) => {
          problemsData.push({ id: doc.id, ...doc.data() } as Problem);
        });
        setProblems(problemsData);
      } catch (error) {
        console.error("Error fetching problems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [activeTab]);

  const handleAddProblem = async (problemData: ProblemFormData) => {
    if (!user) return;

    try {
      const newProblem = {
        ...problemData,
        postedBy: name || "Anonymous",
        postedByUserId: user.uid,
        postedDate: new Date().toISOString(),
        interestCount: 0,
        isTrending: false,
        isRecent: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "problems"), newProblem);
      setProblems((prev) => [{ id: docRef.id, ...newProblem }, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding problem:", error);
    }
  };

  const handleInterestToggle = async (
    problemId: string,
    currentInterest: boolean
  ) => {
    if (!user) return;

    try {
      // In a real app, you'd update Firestore here
      // For now, we'll just update the local state
      setProblems((prev) =>
        prev.map((problem) => {
          if (problem.id === problemId) {
            return {
              ...problem,
              interestCount: currentInterest
                ? problem.interestCount - 1
                : problem.interestCount + 1,
            };
          }
          return problem;
        })
      );
    } catch (error) {
      console.error("Error toggling interest:", error);
    }
  };

  const filteredProblems = problems.filter((problem) => {
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
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header with tabs */}
            <div className="bg-gray-800 border-gray-700 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Problem Statements</h1>
                {user && (
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <FiPlus /> Add Problem
                  </Button>
                )}
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

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <ProblemStatementCard
                      key={problem.id}
                      problem={problem}
                      onInterestToggle={() =>
                        handleInterestToggle(problem.id, false)
                      }
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
            )}
          </div>

          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            <FiltersSection
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
            <UserInterestsSidebar />
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
            <AddProblemModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAddProblem}
            />
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
