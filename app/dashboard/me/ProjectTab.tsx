import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaChalkboardTeacher } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { ResearchItem } from "@/types/ResearchWork";
import ResearchWork from "../repo/ResearchWork";
import { useAuth } from "@/app/auth/AuthContext";

interface ProjectsTabProps {
  onAddProject: () => void;
}

export const ProjectsTab = ({ onAddProject }: ProjectsTabProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ResearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(FIREBASE_DB, "projects");
        const projectsSnap = await getDocs(projectsRef);

        const projectsList: ResearchItem[] = projectsSnap.docs
          .filter((doc) => {
            const data = doc.data();
            return data.status === "Completed" || data.isPublic === true;
          })
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "Untitled Project",
              type: data.category || "Project",
              date: data.createdAt?.toDate().toISOString().split("T")[0] || "",
              description: data.description || "",
              memberDetails: data.memberDetails || {},
              adminDetails: data.adminDetails || {},
              status: data.status,
              category: data.category,
              isProject: true,
              authors: Object.entries(data.memberDetails || {}).map(
                ([id, name]) => ({
                  id,
                  name: name as string,
                })
              ),
            };
          });

        setProjects(projectsList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user?.uid]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaChalkboardTeacher /> Academic Projects
        </h2>
        <Button onClick={onAddProject} className="gap-2">
          <FaChalkboardTeacher size={18} /> Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : projects.length > 0 ? (
        <ResearchWork researchItems={projects} searchQuery="" />
      ) : (
        <Card className="bg-[#252525] border-0">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FaChalkboardTeacher className="text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Public Projects Yet</h3>
            <p className="text-gray-400 mb-4">
              There are currently no completed public projects available
            </p>
          </CardContent>
        </Card>
      )}

      {/* Project Statistics Card */}
      <div className="mt-6">
        <Card className="bg-[#252525] border-0">
          <CardHeader>
            <CardTitle>Project Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xl font-bold">{projects.length}</p>
                <p className="text-xs text-gray-400">Total Projects</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xl font-bold">
                  {projects.reduce(
                    (count, project) =>
                      count +
                      (Object.keys(project.memberDetails || {}).length || 0),
                    0
                  )}
                </p>
                <p className="text-xs text-gray-400">Total Contributors</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xl font-bold">
                  {
                    new Set(
                      projects.flatMap((p) =>
                        Object.values(p.memberDetails ?? {}).concat(
                          Object.values(p.adminDetails ?? {})
                        )
                      )
                    ).size
                  }
                </p>
                <p className="text-xs text-gray-400">Unique Collaborators</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xl font-bold">
                  {new Set(projects.map((p) => p.category)).size}
                </p>
                <p className="text-xs text-gray-400">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
