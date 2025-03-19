"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import Layout from "@/components/Layout";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaPlus, FaUsers, FaEllipsisH, FaEye } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Avatar } from "@/components/ui/avatar";
import Modal from "@/components/Modal";
import ProjectForm from "./newForm";

interface Project {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  onClick?: () => void;
}

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  return words.length > 1 ? words[0][0] + words[1][0] : words[0][0];
};

const colors = [
  ["#1E3A8A", "#3B82F6"],
  ["#5B21B6", "#9333EA"],
  ["#7F1D1D", "#B91C1C"],
  ["#065F46", "#10B981"],
  ["#B45309", "#F59E0B"],
  ["#374151", "#6B7280"],
  ["#1E40AF", "#60A5FA"],
  ["#991B1B", "#DC2626"],
  ["#064E3B", "#047857"],
  ["#4338CA", "#6366F1"],
];

const getGradientFromInitials = (name: string) => {
  const index =
    Math.abs(
      Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;

  return `linear-gradient(to bottom right, ${colors[index][0]}, ${colors[index][1]})`;
};

const SkeletonCard = () => (
  <Card className="w-72 h-36 bg-gray-400 animate-pulse rounded-lg"></Card>
);

const ProjectCard = ({ id, title, onClick, dueDate }: Project) => {
  const router = useRouter();
  const initials = getInitials(title);
  const gradient = getGradientFromInitials(initials);

  return (
    <Card
      onClick={onClick}
      className="w-72 h-36 cursor-pointer transition-transform transform hover:scale-105 bg-cover border-none shadow-md relative overflow-hidden"
      style={{ background: gradient }}
    >
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Avatar
          className="w-14 h-14 text-2xl flex items-center rounded-none justify-center text-white font-bold border border-white shadow-md"
          style={{
            background: gradient,
            boxShadow: `0 4px 12px rgba(255, 255, 255, 0.2)`,
          }}
        >
          {initials.toUpperCase()}
        </Avatar>

        <CardTitle className="text-lg self-start line-clamp-2 text-white max-w-[90%]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <p className="text-xs font-semibold">Due: {dueDate || "N/A"}</p>
        <div className="flex justify-between items-center mt-2">
          <FaEye className="text-lg cursor-pointer opacity-80 hover:opacity-100" />
          <FaUsers className="text-lg cursor-pointer opacity-80 hover:opacity-100" />
          <FaEllipsisH className="text-lg cursor-pointer opacity-80 hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Projects() {
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { replace } = useRouter();

  useEffect(() => {
    const projectsRef = collection(FIREBASE_DB, "projects");
    const q = query(projectsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects: Project[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled",
          status: data.status || "Ongoing",
          dueDate: data.dueDate?.toDate().toLocaleDateString() || "N/A",
        };
      });

      setOngoingProjects(projects.filter((p) => p.status !== "Completed"));
      setCompletedProjects(projects.filter((p) => p.status === "Completed"));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTaskAction = async (projectId?: string) => {
    const params = new URLSearchParams(window.location.search);
    if (projectId) {
      params.set("projectId", projectId);
    } else {
      params.set("projectId", "new");
    }
    replace(`/dashboard/projects?${params.toString()}`, { scroll: false });
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="p-8">
        <Collapsible open>
          <CollapsibleTrigger className="text-base font-semibold mb-4 flex items-center space-x-2">
            📁 Ongoing Projects
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : ongoingProjects.length > 0 ? (
                ongoingProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    onClick={() => handleTaskAction(project.id)}
                  />
                ))
              ) : (
                <p className="text-gray-400">No ongoing projects</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="p-8">
        <Collapsible>
          <CollapsibleTrigger className="text-sm font-semibold mb-4 flex items-center space-x-2">
            ✅ Completed Projects
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))
              ) : (
                <p className="text-gray-400">No completed projects</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="fixed right-12 bottom-12 z-10">
        <button
          onClick={() => handleTaskAction()}
          className="bg-[#5720B7] text-white p-6 rounded-full shadow-gray-400 shadow-md hover:scale-110 transition-transform"
        >
          <FaPlus className="text-2xl" />
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
          <ProjectForm onClick={() => setIsModalOpen(false)} />
        </div>
      </Modal>
    </Layout>
  );
}
