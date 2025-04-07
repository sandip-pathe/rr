"use client";
import { FiHeart, FiUsers, FiCalendar, FiTag } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProblemStatementCard({
  problem,
  onInterestToggle,
}: {
  problem: any;
  onInterestToggle: () => void;
}) {
  const [isInterested, setIsInterested] = useState(false);

  const handleInterest = () => {
    setIsInterested(!isInterested);
    onInterestToggle();
  };

  return (
    <div className="bg-gray-800 border-gray-700 p-6 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{problem.title}</h3>
            <p className="text-gray-200 mt-2">{problem.description}</p>
          </div>
          <Button
            variant={isInterested ? "default" : "outline"}
            size="sm"
            onClick={handleInterest}
            className="flex items-center gap-2"
          >
            <FiHeart className={isInterested ? "fill-current" : ""} />
            {isInterested ? "Interested" : "Show Interest"}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {problem.categories.map((category: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <FiTag className="mr-1" /> {category}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FiUsers /> {problem.interestCount} interested
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar /> Posted {problem.postedDate}
            </span>
          </div>
          <span>Posted by: {problem.postedBy}</span>
        </div>
      </div>
    </div>
  );
}
