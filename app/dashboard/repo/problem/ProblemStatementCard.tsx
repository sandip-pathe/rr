"use client";
import {
  FiHeart,
  FiUsers,
  FiCalendar,
  FiTag,
  FiMail,
  FiLink,
  FiAward,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Problem } from "@/types/problem";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/app/auth/AuthContext";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";

export default function ProblemStatementCard({
  problem,
  onInterestToggle,
}: {
  problem: Problem;
  onInterestToggle: () => void;
}) {
  const { user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);

  useEffect(() => {
    const checkInterest = async () => {
      if (!user) return;

      try {
        const interestRef = doc(
          FIREBASE_DB,
          `users/${user.uid}/interests/${problem.id}`
        );
        const interestSnap = await getDoc(interestRef);
        setIsInterested(interestSnap.exists());
      } catch (error) {
        console.error("Error checking interest:", error);
      }
    };

    checkInterest();
  }, [user, problem.id]);

  const handleInterest = async () => {
    if (!user) return;
    setLoadingInterest(true);

    try {
      const interestRef = doc(
        FIREBASE_DB,
        `users/${user.uid}/interests/${problem.id}`
      );
      const problemRef = doc(FIREBASE_DB, `problems/${problem.id}`);

      if (isInterested) {
        // Remove interest
        await deleteDoc(interestRef);
        await setDoc(
          problemRef,
          {
            interestCount: problem.interestCount - 1,
          },
          { merge: true }
        );
        setIsInterested(false);
      } else {
        // Add interest
        await setDoc(interestRef, {
          problemId: problem.id,
          timestamp: new Date().toISOString(),
        });
        await setDoc(
          problemRef,
          {
            interestCount: problem.interestCount + 1,
          },
          { merge: true }
        );
        setIsInterested(true);
      }

      onInterestToggle(); // Refresh the parent component if needed
    } catch (error) {
      console.error("Error toggling interest:", error);
    } finally {
      setLoadingInterest(false);
    }
  };

  const getDifficultyColor = () => {
    switch (problem.difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{problem.title}</h3>
          {problem.difficulty && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor()} mt-1`}
            >
              {problem.difficulty.charAt(0).toUpperCase() +
                problem.difficulty.slice(1)}
            </span>
          )}
        </div>
        <Button
          variant={isInterested ? "default" : "outline"}
          size="sm"
          onClick={handleInterest}
          className="flex items-center gap-2"
        >
          <FiHeart className={isInterested ? "fill-current" : ""} />
          {isInterested ? "Interested" : "Show Interest"}
          <span className="ml-1">({problem.interestCount})</span>
        </Button>
      </div>

      <p className="text-gray-200 mb-4">{problem.description}</p>

      {problem.expectedOutcomes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-1">
            Expected Outcomes
          </h4>
          <p className="text-gray-400 text-sm">{problem.expectedOutcomes}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {problem.categories.map((category, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            <FiTag className="mr-1" /> {category}
          </span>
        ))}
      </div>

      {problem.resources && problem.resources.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-1">Resources</h4>
          <div className="space-y-1 flex flex-row flex-wrap gap-5">
            {problem.resources.map((resource, index) => (
              <Link
                key={index}
                href={resource}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-400 hover:text-blue-300"
              >
                <FiLink className="mr-1" /> {resource}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FiUsers /> {problem.interestCount} interested
          </span>
          <span className="flex items-center gap-1">
            <FiCalendar /> Posted{" "}
            {format(new Date(problem.postedDate), "MMM d, yyyy")}
          </span>
          {problem.deadline && (
            <span className="flex items-center gap-1">
              <FiAward /> Deadline:{" "}
              {format(new Date(problem.deadline), "MMM d, yyyy")}
            </span>
          )}
        </div>
        <div className="text-right">
          <p>Posted by: {problem.postedBy}</p>
          {problem.contactEmail && (
            <Link
              href={`mailto:${problem.contactEmail}`}
              className="flex items-center justify-end text-blue-400 hover:text-blue-300 text-xs"
            >
              <FiMail className="mr-1" /> Contact
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
