"use client";

import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation"; // For navigation

interface TeamMember {
  name: string;
  role: string;
  avatarUrl: string;
}

interface ProjectDetailsProps {
  title: string;
  description: string;
  team: TeamMember[];
  fund: string;
  tasksPageUrl: string;
  publication?: string;
}

const ProjectDetails = ({
  title,
  description,
  team,
  fund,
  tasksPageUrl,
  publication,
}: ProjectDetailsProps) => {
  const router = useRouter();

  const handleTasksClick = () => {
    router.push(tasksPageUrl); // Navigate to tasks page
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-4 text-gray-700">{description}</p>
        </div>

        {/* Team Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {team.map((member, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fund Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fund Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Total Fund: {fund}</p>
          </CardContent>
        </Card>

        {/* Tasks Button */}
        <button
          onClick={handleTasksClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          View Tasks
        </button>

        {/* Publications Section */}
        {publication && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Related Publication</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={publication}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Publication
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default function ProjectDetailsPage() {
  const projectData = {
    title: "AI-Based Research Analysis",
    description:
      "This project focuses on using artificial intelligence to analyze large datasets in the research domain, helping researchers derive meaningful insights quickly.",
    team: [
      {
        name: "Dr. John Doe",
        role: "Principal Investigator",
        avatarUrl: "/path-to-avatar1.jpg",
      },
      {
        name: "Jane Smith",
        role: "Data Scientist",
        avatarUrl: "/path-to-avatar2.jpg",
      },
      // Add more team members as needed
    ],
    fund: "$50,000",
    tasksPageUrl: "/tasks/ai-research",
    publication: "https://research-publication-link.com",
  };

  return <ProjectDetails {...projectData} />;
}
