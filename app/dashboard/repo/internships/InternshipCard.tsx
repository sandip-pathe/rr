"use client";

import {
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiBookmark,
  FiMapPin,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import ApplyInternshipModal from "./Apply";
import InternshipDetailsModal from "./Details";
import Modal from "@/components/Modal";

const InternshipCard = ({ internship }: any) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getTypeColor = () => {
    switch (internship.type) {
      case "University Research":
        return {
          bg: "bg-blue-900/30",
          border: "border-blue-700",
          text: "text-blue-400",
        };
      case "Student Venture":
        return {
          bg: "bg-purple-900/30",
          border: "border-purple-700",
          text: "text-purple-400",
        };
      case "Corporate Partnership":
        return {
          bg: "bg-green-900/30",
          border: "border-green-700",
          text: "text-green-400",
        };
      case "Government Fellowship":
        return {
          bg: "bg-yellow-900/30",
          border: "border-yellow-700",
          text: "text-yellow-400",
        };
      default:
        return {
          bg: "bg-gray-800",
          border: "border-gray-700",
          text: "text-gray-400",
        };
    }
  };

  const colors = getTypeColor();

  const handleApply = () => {
    if (internship.responseType === "email") {
      const email = internship.contactEmail;

      return;
    }
    setIsApplyModalOpen(true);
  };

  return (
    <>
      <Card
        className={`bg-gray-800 ${colors.border} border hover:border-gray-500 transition-colors`}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-2 ${colors.bg} ${colors.text}`}
              >
                {internship.type}
              </div>
              <CardTitle className="text-white text-lg">
                {internship.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <FiBookmark size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <p className="text-gray-300 mb-4">{internship.description}</p>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <FiUser className={`h-4 w-4 ${colors.text}`} />
              <span className="text-gray-300">
                {internship.professor ||
                  internship.company ||
                  internship.organization ||
                  "N/A"}
              </span>
            </div>

            {internship.department && (
              <div className="flex items-center gap-3">
                <FiMapPin className={`h-4 w-4 ${colors.text}`} />
                <span className="text-gray-300">{internship.department}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <FiCalendar className={`h-4 w-4 ${colors.text}`} />
              <span className="text-gray-300">{internship.duration}</span>
            </div>

            <div className="flex items-center gap-3">
              <FiDollarSign className={`h-4 w-4 ${colors.text}`} />
              <span className="text-gray-300">
                {internship.stipend || internship.equity || "Unpaid"}
              </span>
            </div>
          </div>

          {internship.skills && (
            <div className="mt-4 flex flex-wrap gap-2">
              {internship.skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            onClick={() => setIsDetailsOpen(true)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            onClick={handleApply}
          >
            Apply Now
          </Button>
        </CardFooter>
      </Card>
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      >
        <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
          <ApplyInternshipModal
            onClose={() => setIsApplyModalOpen(false)}
            internship={internship}
          />
        </div>
      </Modal>
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
          <InternshipDetailsModal
            onClose={() => setIsDetailsOpen(false)}
            internship={internship}
          />
        </div>
      </Modal>
    </>
  );
};

export default InternshipCard;
