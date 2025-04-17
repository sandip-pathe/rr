"use client";

import { FiHeart, FiUsers, FiUsers as FiTeam } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface UserInterest {
  id: string;
  title: string;
  interestCount: number;
  problemId: string;
}

export default function UserInterestsSidebar() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [potentialTeams, setPotentialTeams] = useState<
    { problemId: string; count: number }[]
  >([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserInterests = async () => {
      try {
        // Get user's interested problems
        const interestsRef = collection(
          FIREBASE_DB,
          `users/${user.uid}/interests`
        );
        const interestsSnapshot = await getDocs(interestsRef);

        if (interestsSnapshot.empty) {
          setInterests([]);
          setLoading(false);
          return;
        }

        // Get problem details for each interest
        const problemsData: UserInterest[] = [];
        for (const docRef of interestsSnapshot.docs) {
          const problemRef = doc(FIREBASE_DB, `problems/${docRef.id}`);
          const problemSnap = await getDoc(problemRef);
          if (problemSnap.exists()) {
            problemsData.push({
              id: docRef.id,
              title: problemSnap.data().title,
              interestCount: problemSnap.data().interestCount || 0,
              problemId: docRef.id,
            });
          }
        }

        setInterests(problemsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interests:", error);
        setLoading(false);
      }
    };

    fetchUserInterests();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-gray-800 border-gray-700 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiHeart className="text-red-500" /> Your Interests
        </h2>
        <p className="text-sm text-gray-500">
          Please sign in to view your interests
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border-gray-700 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiHeart className="text-red-500" /> Your Interests
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="border-b pb-3 last:border-0">
              <Card className="w-[60%] h-4 mt-1" />
              <Card className="w-[60%] h-4 mt-1" />
            </div>
          ))}
        </div>
      ) : interests.length > 0 ? (
        <ul className="space-y-3">
          {interests.map((problem) => (
            <li key={problem.id} className="border-b pb-3 last:border-0">
              <Link
                href={`/problems/${problem.problemId}`}
                className="font-medium hover:text-blue-400 transition-colors"
              >
                {problem.title}
              </Link>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <FiUsers /> {problem.interestCount} interested
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">
          You have not shown interest in any problems yet
        </p>
      )}

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium">Team Matching</h3>
        <p className="text-xs text-gray-500 mt-1">
          When multiple users show interest in the same problem, we will suggest
          forming a team.
        </p>
      </div>
    </div>
  );
}
