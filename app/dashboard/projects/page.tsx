"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import Layout from "@/components/Layout";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaPlus } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FIREBASE_DB } from "@/FirebaseConfig";

interface Project {
  id: string;
  title: string;
  status: string;
  description: string;
  category: string;
  dueDate: string;
  createdAt: string;
}

const ProjectCard = ({
  id,
  title,
  status,
  description,
  category,
  dueDate,
  createdAt,
}: Project) => {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/dashboard/projects/${id}`)}
      className="w-70 h-40 cursor-pointer transition-transform transform hover:scale-105"
    >
      <CardHeader>
        <CardTitle className="text-lg truncate max-w-full overflow-hidden whitespace-nowrap">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>
            <strong>Due Date:</strong> {dueDate || "N/A"}
          </p>
          <p>
            <strong>Created At:</strong> {createdAt || "N/A"}
          </p>
          <p>
            <strong>Category:</strong> {category}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Projects() {
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const router = useRouter();

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
          description: data.description || "",
          category: data.category || "General",
          dueDate: data.dueDate?.toDate().toLocaleDateString() || "N/A",
          createdAt: data.createdAt?.toDate().toLocaleDateString() || "N/A",
        };
      });

      setOngoingProjects(projects);
      setCompletedProjects(projects.filter((p) => p.status === "Completed"));
    });

    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <Collapsible open>
          <CollapsibleTrigger className="text-sm font-semibold mb-4">
            Ongoing Projects
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ongoingProjects.length > 0 ? (
                ongoingProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
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
          <CollapsibleTrigger className="text-sm font-semibold mb-4">
            Completed Projects
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

      <div className="flex z-10 fixed right-6 bottom-6">
        <button
          onClick={() => router.push("/dashboard/projects/new")}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition"
        >
          <FaPlus className="text-xl" />
        </button>
      </div>
    </Layout>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import {
//   collection,
//   query,
//   onSnapshot,
//   where,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import Layout from "@/components/Layout";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import { FaPlus } from "react-icons/fa";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { useRouter } from "next/navigation";
// import { FIREBASE_DB } from "@/FirebaseConfig";
// import { useAuth } from "@/context/AuthContext"; // Assuming you have an AuthContext

// interface Project {
//   id: string;
//   title: string;
//   status: string;
//   tasks: string;
//   progress: number;
// }

// const ProjectCard = ({ id, title, status, tasks, progress }: Project) => {
//   const router = useRouter();

//   return (
//     <Card
//       onClick={() => router.push(`/dashboard/projects/${id}`)}
//       className="w-70 h-60 cursor-pointer transition-transform transform hover:scale-105"
//     >
//       <CardHeader>
//         <CardTitle className="text-lg truncate max-w-full overflow-hidden whitespace-nowrap">
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p>
//           <strong>Tasks:</strong> {tasks}
//         </p>
//         {status === "Ongoing" && (
//           <div className="py-2">
//             <Progress value={progress} />
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default function Projects() {
//   const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
//   const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
//   const router = useRouter();
//   const { user } = useAuth(); // Get logged-in user from context

//   useEffect(() => {
//     if (!user) return;

//     const fetchUserProjects = async () => {
//       try {
//         const userRef = doc(FIREBASE_DB, "users", user.uid);
//         const userSnap = await getDoc(userRef);

//         if (!userSnap.exists()) return;

//         const userData = userSnap.data();
//         const userProjectIds: string[] = userData.projects || [];

//         if (userProjectIds.length === 0) return;

//         // Fetch projects where ID is in user's projects
//         const projectsRef = collection(FIREBASE_DB, "projects");
//         const q = query(projectsRef, where("__name__", "in", userProjectIds));

//         const unsubscribe = onSnapshot(q, (snapshot) => {
//           const projects: Project[] = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           })) as Project[];

//           setOngoingProjects(projects.filter((p) => p.status === "Ongoing"));
//           setCompletedProjects(
//             projects.filter((p) => p.status === "Completed")
//           );
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Error fetching projects:", error);
//       }
//     };

//     fetchUserProjects();
//   }, [user]);

//   return (
//     <Layout>
//       <div className="p-8">
//         <Collapsible open>
//           <CollapsibleTrigger className="text-sm font-semibold mb-4">
//             Ongoing Projects
//           </CollapsibleTrigger>
//           <CollapsibleContent>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {ongoingProjects.length > 0 ? (
//                 ongoingProjects.map((project) => (
//                   <ProjectCard key={project.id} {...project} />
//                 ))
//               ) : (
//                 <p className="text-gray-400">No ongoing projects</p>
//               )}
//             </div>
//           </CollapsibleContent>
//         </Collapsible>
//       </div>

//       <div className="p-8">
//         <Collapsible>
//           <CollapsibleTrigger className="text-sm font-semibold mb-4">
//             Completed Projects
//           </CollapsibleTrigger>
//           <CollapsibleContent>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {completedProjects.length > 0 ? (
//                 completedProjects.map((project) => (
//                   <ProjectCard key={project.id} {...project} />
//                 ))
//               ) : (
//                 <p className="text-gray-400">No completed projects</p>
//               )}
//             </div>
//           </CollapsibleContent>
//         </Collapsible>
//       </div>

//       <div className="flex z-10 fixed right-6 bottom-6">
//         <button
//           onClick={() => router.push("/dashboard/projects/new")}
//           className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition"
//         >
//           <FaPlus className="text-xl" />
//         </button>
//       </div>
//     </Layout>
//   );
// }
