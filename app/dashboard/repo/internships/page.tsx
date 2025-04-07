"use client";

import { DiscoverTabs } from "../Tabs";
import InternshipCard from "./InternshipCard";
import AddInternshipForm from "./AddInternshipForm";
import ResourcesSection from "./ResourcesSection";
import Layout from "@/components/Layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiFilter,
  FiRefreshCw,
  FiPlus,
  FiBookOpen,
  FiAward,
  FiBriefcase,
} from "react-icons/fi";
import { useState } from "react";
import AddInternshipModal from "./AddInternshipForm";

const internships = [
  {
    id: 1,
    title: "Research Assistant - AI Lab",
    type: "University Research",
    department: "Computer Science",
    professor: "Dr. Smith",
    duration: "3 months",
    stipend: "$1,500/month",
    deadline: "2023-11-15",
    description:
      "Assist in cutting-edge AI research with focus on NLP applications.",
    requirements: "Python, Machine Learning basics, 3.5+ GPA",
    skills: ["Python", "Machine Learning", "NLP", "Research"],
  },
  {
    id: 2,
    title: "Technical Intern - Student Startup",
    type: "Student Venture",
    company: "NeuroTech",
    founders: "CS Senior Students",
    duration: "6 months",
    equity: "Possible equity option",
    deadline: "2023-11-30",
    description: "Help develop our brain-computer interface prototype.",
    requirements: "Embedded Systems, Signal Processing",
    skills: ["Embedded Systems", "Signal Processing", "C++", "PCB Design"],
  },
  {
    id: 3,
    title: "Industry Internship - Tech Giant",
    type: "Corporate Partnership",
    company: "TechCorp",
    location: "Remote",
    duration: "Summer 2024",
    stipend: "$4,000/month",
    deadline: "2024-01-15",
    description: "Summer internship program for top engineering students.",
    requirements: "Strong coding skills, projects portfolio",
    skills: ["JavaScript", "React", "Node.js", "Algorithms"],
  },
  {
    id: 4,
    title: "Government Research Program",
    type: "Government Fellowship",
    organization: "National Science Foundation",
    duration: "10 weeks",
    stipend: "$5,000 total",
    deadline: "2024-02-01",
    description:
      "Summer research experience for undergraduates in STEM fields.",
    requirements: "STEM major, 3.0+ GPA",
    skills: ["Research Methods", "Data Analysis", "Academic Writing"],
  },
];

export default function InternshipsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSuccess = () => {
    console.log("New internship added successfully!");
  };

  return (
    <Layout>
      <DiscoverTabs />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 m-6">
        {/* Left Sidebar - Resources */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FiBriefcase className="text-blue-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Internship Stats
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Available</span>
                <span className="text-white font-medium">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Applied</span>
                <span className="text-white font-medium">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Deadlines</span>
                <span className="text-white font-medium">3 upcoming</span>
              </div>
            </CardContent>
          </Card>

          {/* Application Tracker */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FiAward className="text-purple-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Your Applications
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-white text-sm">
                    AI Research (Interview)
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-white text-sm">TechCorp (Applied)</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
                  <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                  <span className="text-white text-sm">
                    NeuroTech (Rejected)
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="text-blue-400 w-full hover:bg-gray-700"
              >
                View All Applications
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Resources */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FiBookOpen className="text-green-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Quick Resources
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                Resume Templates
              </Button>
              <Button
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                Cover Letter Guide
              </Button>
              <Button
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                Interview Prep
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Internship Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search/Filter Bar */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search internships by title, skills, or professor..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <FiFilter size={16} />
                Filter
              </Button>
              <Button
                variant="outline"
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white flex items-center gap-2"
              >
                <FiRefreshCw size={16} />
              </Button>
            </div>
          </Card>

          {/* Internship Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {internships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        </div>

        {/* Right Sidebar - Add Internship & Resources */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 border-none text-white gap-2"
              >
                <FiPlus className="text-yellow-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Add Opportunity
                </CardTitle>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Professors and startups can list new internship opportunities
                here
              </p>
              <AddInternshipModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitSuccess={handleSuccess}
              />
            </CardContent>
          </Card>

          {/* Resources Section */}
          <ResourcesSection />
        </div>
      </div>
    </Layout>
  );
}
