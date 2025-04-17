"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import Layout from "@/components/Layout";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaPlus } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Modal from "@/components/Modal";
import ProjectForm from "./newForm";
import { useAuth } from "@/app/auth/AuthContext";
import ProjectViewCard from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  createdAt?: string;
  admins: string[];
  members: string[];
  userRole: ProjectRole;
  adminDetails: Record<string, string>;
  memberDetails: Record<string, string>;
  description?: string;
  category?: string;
}

type ProjectRole = "admin" | "member" | "none";

const getUserRole = (
  project: Omit<Project, "userRole">,
  uid: string
): ProjectRole => {
  if (!uid) return "none";
  if (project.admins?.includes(uid)) return "admin";
  if (project.members?.includes(uid)) return "member";
  return "none";
};

const SkeletonCard = () => (
  <Card className="w-72 h-48 bg-gray-400 animate-pulse rounded-lg"></Card>
);

export default function Projects() {
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { replace } = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const projectsRef = collection(FIREBASE_DB, "projects");
        const snapshot = await getDocs(projectsRef);

        const projects: Project[] = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const userId = user.uid;
          const role = getUserRole(
            {
              id: doc.id,
              title: data.title || "Untitled",
              status: data.status || "Ongoing",
              dueDate: data.dueDate?.toDate().toLocaleDateString() || "N/A",
              createdAt: data.createdAt?.toDate().toLocaleDateString() || "N/A",
              admins: data.admins || [],
              members: data.members || [],
              adminDetails: data.adminDetails || {},
              memberDetails: data.memberDetails || {},
              description: data.description || "",
              category: data.category || "",
            },
            userId
          );

          if (role !== "none") {
            projects.push({
              id: doc.id,
              title: data.title || "Untitled",
              status: data.status || "Ongoing",
              dueDate: data.dueDate?.toDate().toLocaleDateString() || "N/A",
              createdAt: data.createdAt?.toDate().toLocaleDateString() || "N/A",
              admins: data.admins || [],
              members: data.members || [],
              userRole: role,
              adminDetails: data.adminDetails || {},
              memberDetails: data.memberDetails || {},
              description: data.description || "",
              category: data.category || "",
            });
          }
        });

        setOngoingProjects(projects.filter((p) => p.status !== "Completed"));
        setCompletedProjects(projects.filter((p) => p.status === "Completed"));
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.uid]);

  const handleEditProject = (projectId: string) => {
    const params = new URLSearchParams();
    params.set("projectId", projectId);
    replace(`/dashboard/projects?${params.toString()}`, { scroll: false });
    setIsModalOpen(true);
  };

  const handleCreateProject = () => {
    const params = new URLSearchParams();
    params.set("projectId", "new");
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
                  <ProjectViewCard
                    key={project.id}
                    {...project}
                    onEdit={handleEditProject}
                  />
                ))
              ) : (
                <>
                  <Card
                    onClick={handleCreateProject}
                    className="w-72 h-40 cursor-pointer transition-transform transform hover:scale-105 bg-cover border-none shadow-md relative overflow-hidden justify-center items-center flex flex-col rounded-lg bg-gradient-to-r from-[#10B981] to-[#065F46]"
                  >
                    <FaPlus className="text-2xl" />
                    <span className="text-lg font-semibold ml-2">
                      Create New Project
                    </span>
                  </Card>
                </>
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
                  <ProjectViewCard
                    key={project.id}
                    {...project}
                    onEdit={handleEditProject}
                  />
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
          onClick={handleCreateProject}
          className="bg-[#5720B7] text-white p-6 rounded-full hover:scale-110 transition-transform"
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
