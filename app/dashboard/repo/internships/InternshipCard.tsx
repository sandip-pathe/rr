"use client";

import {
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiBookmark,
  FiMapPin,
  FiExternalLink,
  FiMail,
  FiEdit,
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
import Link from "next/link";
import { useAuth } from "@/app/auth/AuthContext";
import {
  getInternshipTypeDisplay,
  Internship,
  InternshipType,
} from "@/types/Internship";
import { Badge } from "@/components/ui/badge";
import { BsFillBuildingFill } from "react-icons/bs";

const InternshipCard = ({ internship }: { internship: Internship }) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { user } = useAuth();

  const getTypeBadgeVariant = (type: InternshipType) => {
    switch (type) {
      case "university":
        return "outline";
      case "startup":
        return "outline";
      case "corporate":
        return "secondary";
      case "government":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleApply = () => {
    switch (internship.responseType) {
      case "in-app":
        setIsApplyModalOpen(true);
        break;
      case "email":
        if (internship.contactEmail) {
          const subject = `Application for ${internship.title}`;
          const body = `Dear ${
            internship.professor || internship.company || "Hiring Manager"
          },

I am writing to express my interest in the ${internship.title} position. 

[Your message here]

Best regards,
[Your Name]
[Your Contact Information]
[Your Portfolio/Website if applicable]`;

          window.location.href = `mailto:${
            internship.contactEmail
          }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            body
          )}`;
        }
        break;
      case "site":
        if (internship.applyLink) {
          window.open(internship.applyLink, "_blank");
        }
        break;
      default:
        setIsApplyModalOpen(true);
    }
  };

  const getApplyButtonIcon = () => {
    switch (internship.responseType) {
      case "email":
        return <FiMail className="mr-2" size={14} />;
      case "site":
        return <FiExternalLink className="mr-2" size={14} />;
      default:
        return null;
    }
  };

  const getContactName = () => {
    switch (internship.type) {
      case "university":
        return internship.professor;
      case "startup":
        return internship.founders;
      case "corporate":
        return internship.company;
      case "government":
        return internship.organization;
      default:
        return internship.organization || "Contact";
    }
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 hover:border-gray-500 transition-colors">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-2">
              <Badge variant={getTypeBadgeVariant(internship.type)}>
                {getInternshipTypeDisplay(internship.type)}
              </Badge>
              <CardTitle className="text-white text-lg">
                {internship.title}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {user?.uid === internship.createdId && (
                <Link href={`/manage/${internship.id}`} passHref>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    title="Manage listing"
                  >
                    <FiEdit size={16} />
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <FiBookmark size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4">
          <p className="text-gray-300 line-clamp-3">{internship.description}</p>

          <div className="grid gap-3 text-sm">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FiUser className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{getContactName()}</span>
              </div>

              {internship.department && (
                <div className="flex items-center gap-3">
                  <BsFillBuildingFill className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{internship.department}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {internship.location && (
                <div className="flex items-center gap-3">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{internship.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <FiCalendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{internship.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FiDollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {internship.compensationType === "paid"
                  ? internship.compensation || "Paid"
                  : internship.compensationType === "stipend"
                  ? internship.compensation || "Stipend"
                  : "Unpaid"}
              </span>
            </div>
          </div>

          {internship.skills && internship.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {internship.skills.map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-gray-300 bg-gray-700"
                >
                  {skill}
                </Badge>
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
            className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white flex items-center justify-center"
            onClick={handleApply}
            disabled={internship.status === "closed"}
          >
            {getApplyButtonIcon()}
            {internship.status === "closed" ? "Closed" : "Apply Now"}
          </Button>
        </CardFooter>
      </Card>

      {internship.responseType === "in-app" && (
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
      )}

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
