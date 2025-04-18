"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ResearchItem } from "@/types/ResearchWork";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChalkboardTeacher, FaSearch, FaFilter } from "react-icons/fa";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Layout from "@/components/Layout";
import { DiscoverTabs } from "../Tabs";
import Modal from "@/components/Modal";
import ProjectForm from "../../projects/newForm";

export default function InternshipsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ResearchItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ResearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState<"recent" | "members">(
    "recent"
  );
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch public projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(FIREBASE_DB, "projects");
        const q = query(projectsRef, where("isPublic", "==", true));
        const projectsSnap = await getDocs(q);

        const projectsList: ResearchItem[] = projectsSnap.docs.map((doc) => {
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
        setFilteredProjects(projectsList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...projects];

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(lowerQuery) ||
          project.description.toLowerCase().includes(lowerQuery) ||
          Object.values(project?.memberDetails || {}).some((name) =>
            String(name).toLowerCase().includes(lowerQuery)
          )
      );
    }

    // Apply category filter
    if (filterCategory !== "All") {
      result = result.filter((project) => project.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortCriteria === "recent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        // Sort by number of members
        const aMembers = Object.keys(a.memberDetails || {}).length;
        const bMembers = Object.keys(b.memberDetails || {}).length;
        return bMembers - aMembers;
      }
    });

    setFilteredProjects(result);
  }, [projects, searchQuery, sortCriteria, filterCategory]);

  const uniqueCategories = Array.from(
    new Set(projects.map((project) => project.category || "Uncategorized"))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <DiscoverTabs />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaChalkboardTeacher className="text-blue-500" />
            Public Projects
          </h1>
          <Button onClick={() => setIsModalOpen(true)} asChild>
            <div>
              <FaChalkboardTeacher className="mr-2" /> Add Project
            </div>
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <select
                  className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <Button
                  variant={sortCriteria === "recent" ? "default" : "outline"}
                  onClick={() => setSortCriteria("recent")}
                  className="flex-1"
                >
                  Most Recent
                </Button>
                <Button
                  variant={sortCriteria === "members" ? "default" : "outline"}
                  onClick={() => setSortCriteria("members")}
                  className="flex-1"
                >
                  Most Members
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {project.title}
                  </CardTitle>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{project.category}</span>
                    <span>{project.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 line-clamp-3 mb-4">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      {Object.keys(project.memberDetails ?? {}).length} members
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 border-0">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <FaChalkboardTeacher className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No Public Projects Found
              </h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || filterCategory !== "All"
                  ? "Try adjusting your search or filters"
                  : "There are currently no public projects available"}
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                Create New Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {projects.length > 0 && (
          <Card className="mt-8 bg-gray-800 border-0">
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-xl font-bold">{projects.length}</p>
                  <p className="text-xs text-gray-400">Total Projects</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-xl font-bold">
                    {projects.reduce(
                      (count, project) =>
                        count + Object.keys(project.memberDetails || {}).length,
                      0
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Total Contributors</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-xl font-bold">
                    {
                      new Set(
                        projects.flatMap((p) => [
                          ...Object.values(p.memberDetails || {}),
                          ...Object.values(p.adminDetails || {}),
                        ])
                      ).size
                    }
                  </p>
                  <p className="text-xs text-gray-400">Unique Collaborators</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-xl font-bold">{uniqueCategories.length}</p>
                  <p className="text-xs text-gray-400">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
          <ProjectForm onClick={() => setIsModalOpen(false)} />
        </div>
      </Modal>
    </Layout>
  );
}
