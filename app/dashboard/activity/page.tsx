"use client";

import {
  Bookmark,
  Lightbulb,
  Megaphone,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  FileText,
  Video,
} from "lucide-react";
import { PiPersonFill } from "react-icons/pi";
import { TbBrandFeedly } from "react-icons/tb";
import { LuHandHeart } from "react-icons/lu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useRouter } from "next/navigation";

interface ResearchItem {
  id: string;
  title: string;
  type: string;
  date: string;
  reads?: number;
  citations?: number;
  description: string;
  publishedIn?: string;
  isProject?: boolean;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  categories: string[];
  interestCount: number;
}

interface Internship {
  id: string;
  title: string;
  deadline: string;
  description: string;
  compensationType: string;
}

export default function InnovationDashboard() {
  const router = useRouter();
  const [trendingProjects, setTrendingProjects] = useState<ResearchItem[]>([]);
  const [recommendedInternships, setRecommendedInternships] = useState<
    Internship[]
  >([]);
  const [problemSpotlight, setProblemSpotlight] = useState<Problem | null>(
    null
  );
  const [researchDigest, setResearchDigest] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState({
    projects: true,
    internships: true,
    problems: true,
    research: true,
  });

  const innovationTip =
    "When brainstorming, quantity leads to quality. Generate 20 ideas quickly, then refine the top 3.";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest 3 projects
        const projectsQuery = query(
          collection(FIREBASE_DB, "projects"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "Untitled Project",
          type: doc.data().category || "Project",
          date:
            doc.data().createdAt?.toDate().toISOString().split("T")[0] || "",
          description: doc.data().description || "",
          isProject: true,
        }));
        setTrendingProjects(projectsData);
        setLoading((prev) => ({ ...prev, projects: false }));

        // Fetch latest 3 open internships
        const internshipsQuery = query(
          collection(FIREBASE_DB, "internships"),
          where("status", "==", "open"),
          limit(3)
        );
        const internshipsSnapshot = await getDocs(internshipsQuery);
        const internshipsData = internshipsSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          deadline: doc.data().deadline,
          description: doc.data().description,
          compensationType: doc.data().compensationType,
        }));
        setRecommendedInternships(internshipsData);
        setLoading((prev) => ({ ...prev, internships: false }));

        // Fetch a random problem
        const problemsQuery = query(
          collection(FIREBASE_DB, "problems"),
          orderBy("interestCount", "desc"),
          limit(1)
        );
        const problemsSnapshot = await getDocs(problemsQuery);
        if (!problemsSnapshot.empty) {
          const problemDoc = problemsSnapshot.docs[0];
          setProblemSpotlight({
            id: problemDoc.id,
            title: problemDoc.data().title,
            description: problemDoc.data().description,
            categories: problemDoc.data().categories || [],
            interestCount: problemDoc.data().interestCount || 0,
          });
        }
        setLoading((prev) => ({ ...prev, problems: false }));

        // Fetch latest 2 research items
        const researchQuery = query(
          collection(FIREBASE_DB, "work"),
          orderBy("date", "desc"),
          limit(2)
        );
        const researchSnapshot = await getDocs(researchQuery);
        const researchData = researchSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "Untitled",
          type: doc.data().type || "Unknown",
          date: doc.data().date?.toDate().toISOString().split("T")[0] || "",
          reads: doc.data().reads || 0,
          description: doc.data().description || "",
          publishedIn: doc.data().publishedIn || "",
        }));
        setResearchDigest(researchData);
        setLoading((prev) => ({ ...prev, research: false }));
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set loading to false even if there's an error
        setLoading({
          projects: false,
          internships: false,
          problems: false,
          research: false,
        });
      }
    };

    fetchData();
  }, []);

  // Loading state UI
  if (Object.values(loading).some((v) => v)) {
    return (
      <div className="w-full h-full p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <Tabs defaultValue="feed" className="w-full">
        {/* TabsList remains the same */}
        <TabsList className="grid w-full grid-cols-3 h-12 bg-[#252525]">
          <TabsTrigger value="for-you" className="flex items-center gap-2">
            <PiPersonFill />
            For You
          </TabsTrigger>
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <TbBrandFeedly />
            Feed
          </TabsTrigger>
          <TabsTrigger value="research" className="flex items-center gap-2">
            <LuHandHeart />
            Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Projects */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold">Top Projects</h2>
              </div>
              <div className="space-y-3">
                {trendingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{project.title}</h3>
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                        {project.reads || 0} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem Spotlight */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <AlertCircle className="text-purple-400 mr-2" />
                <h2 className="text-lg font-semibold">Problem Spotlight</h2>
              </div>
              {problemSpotlight && (
                <div className="p-3 bg-gray-700 rounded">
                  <h3 className="font-medium">{problemSpotlight.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {problemSpotlight.description}
                  </p>
                  <div className="flex flex-wrap mt-2 gap-1">
                    {problemSpotlight.categories.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="mt-3 text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded transition">
                    View Details
                  </button>
                </div>
              )}
            </div>

            {/* Research Digest */}
            <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
              <div className="flex items-center mb-3">
                <FileText className="text-red-400 mr-2" />
                <h2 className="text-lg font-semibold">Research Digest</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchDigest.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <p className="text-xs text-gray-400">
                      {item.publishedIn || "No publisher"}
                    </p>
                    <h3 className="font-medium mt-1">{item.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {item.description.substring(0, 100)}...
                    </p>
                    <button className="mt-2 text-sm text-red-400 hover:text-red-300 transition">
                      Read more →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* For You Tab Content */}
        <TabsContent value="for-you" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Projects for You */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold">Top Projects For You</h2>
              </div>
              <div className="space-y-3">
                {trendingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{project.title}</h3>
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                        {Math.floor(Math.random() * 20) + 80}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {project.reads || 0} views this week
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities For You */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <GraduationCap className="text-green-400 mr-2" />
                <h2 className="text-lg font-semibold">Opportunities For You</h2>
              </div>
              <div className="space-y-3">
                {recommendedInternships.map((internship) => (
                  <div
                    key={internship.id}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{internship.title}</h3>
                      <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                        {Math.floor(Math.random() * 20) + 80}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Apply by {internship.deadline}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions (unchanged) */}
            <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => router.push("/dashboard/repo/problem")}
                  className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  <Megaphone className="text-blue-400 mb-1" />
                  <span className="text-sm">Post Idea</span>
                </button>
                <button
                  onClick={() => router.push("/dashboard/repo/open")}
                  className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  <Bookmark className="text-green-400 mb-1" />
                  <span className="text-sm">Save Project</span>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/watch?v=733m6qBH-jI",
                      "_blank"
                    )
                  }
                  className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  <Video className="text-purple-400 mb-1" />
                  <span className="text-sm">Watch Demo</span>
                </button>
                <button
                  onClick={() => router.push("/dashboard/people")}
                  className="flex flex-col items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  <GraduationCap className="text-red-400 mb-1" />
                  <span className="text-sm">Find Mentor</span>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Research Tab Content */}
        <TabsContent value="research" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Research Digest Expanded */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <FileText className="text-red-400 mr-2" />
                <h2 className="text-lg font-semibold">Latest Research</h2>
              </div>
              <div className="space-y-4">
                {researchDigest.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-700 rounded hover:bg-gray-600 transition cursor-pointer"
                  >
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.publishedIn || "No publisher"}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      {item.description.substring(0, 150)}...
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <button className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">
                        Read Full Paper
                      </button>
                      <span className="text-xs text-gray-400">
                        {item.date || "No date"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Innovation Tip (unchanged) */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Lightbulb className="text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold">Innovation Tip</h2>
              </div>
              <div className="p-4 bg-yellow-900 bg-opacity-20 rounded border border-yellow-800">
                <p className="italic">"{innovationTip}"</p>
                <p className="text-xs text-gray-400 mt-2">
                  — Innovation Lab Team
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
