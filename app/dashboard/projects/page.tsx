"use client";

import Layout from "@/components/Layout";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation"; // For navigation

interface ProjectCardProps {
  id: string;
  title: string;
  status: string;
  team: string[];
  tasks: string;
  progress: number;
  fund: string;
}

const ProjectCard = ({
  id,
  title,
  status,
  team,
  tasks,
  progress,
  fund,
}: ProjectCardProps) => {
  const router = useRouter();

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/projects/${id}`);
  };

  return (
    <Card
      onClick={() => handleCardClick(id)}
      className="w-70 h-60 cursor-pointer transition-transform transform hover:scale-105"
    >
      <CardHeader>
        <CardTitle className="text-lg truncate max-w-full overflow-hidden whitespace-nowrap">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Tasks:</strong> {tasks}
        </p>
        {status === "Ongoing" ? (
          <div className="py-2">
            <Progress value={progress} />
          </div>
        ) : (
          <p></p>
        )}
      </CardContent>
    </Card>
  );
};

export default function Projects() {
  const ongoingProjects = [
    {
      id: "1",
      title: "AI-Based Research Analysis",
      status: "Ongoing",
      team: ["Dr. John Doe", "Jane Smith"],
      tasks: "35/50",
      progress: 70,
      fund: "$50,000",
    },
    {
      id: "2",
      title: "Quantum Computing Advances",
      status: "Ongoing",
      team: ["Prof. Alice Walker", "Tom Gray"],
      tasks: "20/30",
      progress: 66,
      fund: "$100,000",
    },
    {
      id: "3",
      title: "AI-Based Research Analysis",
      status: "Ongoing",
      team: ["Dr. John Doe", "Jane Smith"],
      tasks: "35/50",
      progress: 70,
      fund: "$50,000",
    },
    {
      id: "4",
      title: "Quantum Computing Advances",
      status: "Ongoing",
      team: ["Prof. Alice Walker", "Tom Gray"],
      tasks: "20/30",
      progress: 66,
      fund: "$100,000",
    },
  ];

  const completedProjects = [
    {
      id: "5",
      title: "Blockchain for Education",
      status: "Completed",
      team: ["Dr. Mike Lee", "Emily Rose"],
      tasks: "50/50",
      progress: 100,
      fund: "$75,000",
    },
    {
      id: "7",
      title: "Nanotechnology in Medicine",
      status: "Completed",
      team: ["Prof. Sarah Lim", "John White"],
      tasks: "40/40",
      progress: 100,
      fund: "$60,000",
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <Collapsible open>
          <CollapsibleTrigger className="text-sm font-semibold mb-4">
            Ongoing Projects
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ongoingProjects.map((project, idx) => (
                <ProjectCard key={idx} {...project} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Completed Projects - Collapsed by Default */}
      <div className="p-8">
        <Collapsible>
          <CollapsibleTrigger className="text-sm font-semibold mb-4">
            Completed Projects
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {completedProjects.map((project, idx) => (
                <ProjectCard key={idx} {...project} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Layout>
  );
}
