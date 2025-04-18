import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MdScience } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { ResearchItem } from "@/types/ResearchWork";
import ResearchWork from "../repo/ResearchWork";
import { useAuth } from "@/app/auth/AuthContext";
import { useRouter } from "next/navigation";

interface ResearchTabProps {
  userId: string;
  onAddResearch: () => void;
  coAuthors?: string[];
}

export const ResearchTab = ({
  userId,
  onAddResearch,
  coAuthors = [],
}: ResearchTabProps) => {
  const router = useRouter();
  const { user, name } = useAuth();
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [completedProjects, setCompletedProjects] = useState<ResearchItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch works where the current user is an author
        const worksRef = collection(FIREBASE_DB, "work");
        const worksSnap = await getDocs(worksRef);
        const worksList: ResearchItem[] = worksSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled",
            type: data.type || "Unknown",
            date: data.date?.toDate().toISOString().split("T")[0] || "",
            reads: data.reads || 0,
            citations: data.citations || 0,
            description: data.description || "",
            doi: data.doi || "",
            futureScope: data.futureScope || "",
            authors: data.authors || [],
            publishedIn: data.publishedIn || "",
            publisher: data.publisher || "",
            location: data.location || "",
            edition: data.edition || "",
            isProject: false,
          };
        });

        // Fetch projects where the current user is a member or admin
        const projectsRef = collection(FIREBASE_DB, "projects");
        const projectsSnap = await getDocs(projectsRef);
        const projectsList: ResearchItem[] = projectsSnap.docs
          .filter((doc) => {
            const data = doc.data();
            const memberDetails = data.memberDetails || {};
            const adminDetails = data.adminsDetails || {};
            return (
              data.status === "Completed" &&
              (Object.values(memberDetails).includes(user?.uid) ||
                Object.values(adminDetails).includes(user?.uid))
            );
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
              authhorDetails: data.adminsDetails || {},
              status: data.status,
              category: data.category,
              isProject: true,
            };
          });

        setResearchItems(worksList);
        setCompletedProjects(projectsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, name]);

  const userResearchItems = [...researchItems, ...completedProjects];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MdScience /> Research Works
        </h2>
        <Button onClick={onAddResearch} className="gap-2">
          <MdScience size={18} /> Add Research
        </Button>
      </div>

      <div className="gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : userResearchItems.length > 0 ? (
            <ResearchWork researchItems={userResearchItems} searchQuery="" />
          ) : (
            <Card className="bg-[#252525] border-0">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <MdScience className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  No Research Works Yet
                </h3>
                <p className="text-gray-400 mb-4">
                  You haven't published any research works or completed projects
                  yet
                </p>
                <Button onClick={onAddResearch} className="gap-2">
                  <MdScience size={18} /> Add Your First Research Work
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CardFooter className="text-center">
        {researchItems.length > 0 && (
          <p
            onClick={() => {
              router.push(`/dashboard/repo`);
            }}
            className="cursor-pointer text-blue-400 hover:underline"
          >
            View All Research
          </p>
        )}
      </CardFooter>
    </>
  );
};
