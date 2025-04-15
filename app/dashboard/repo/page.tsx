// SearchRepo.tsx
"use client";

import React, { useEffect, useState } from "react";
import ResearchWork from "./ResearchWork";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { DiscoverTabs } from "./Tabs";
import { ResearchItem } from "@/types/ResearchWork";

const SearchRepo = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("relevance");
  const [filterType, setFilterType] = useState<string>("All");
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [completedProjects, setCompletedProjects] = useState<ResearchItem[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const projectsRef = collection(FIREBASE_DB, "projects");
        const projectsSnap = await getDocs(projectsRef);
        const projectsList: ResearchItem[] = projectsSnap.docs
          .filter((doc) => doc.data().status === "Completed")
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
      }
    };

    fetchData();
  }, []);

  const allItems = [...researchItems, ...completedProjects];

  const sortedItems = [...allItems].sort((a, b) => {
    switch (sortCriteria) {
      case "recent":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "citations":
        return (b.citations || 0) - (a.citations || 0);
      default:
        return 0;
    }
  });

  const uniqueTypes = Array.from(
    new Set(allItems.map((item) => (item.isProject ? "Project" : item.type)))
  );

  const filteredItems = sortedItems.filter((item) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(lowerSearchQuery);
    const abstractMatch = item.description
      ?.toLowerCase()
      .includes(lowerSearchQuery);
    const authorMatch = item.authors?.some((author) =>
      author.name.toLowerCase().includes(lowerSearchQuery)
    );
    const typeMatch =
      filterType === "All" ||
      (item.isProject ? "Project" : item.type) === filterType;

    return (titleMatch || authorMatch || abstractMatch) && typeMatch;
  });

  return (
    <Layout>
      <DiscoverTabs />
      <h1 className="text-2xl font-semibold text-gray-300 ml-10 mt-5">
        Research Repository
      </h1>
      <div className="flex flex-row">
        <div className="w-1/6"></div>
        <div className="mt-5 w-1/2 ">
          <input
            type="text"
            className="p-2 w-full border border-gray-300 rounded"
            placeholder="Search by title, author, or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="m-2 flex flex-row justify-center items-center gap-5">
            <span className="font-semibold bg-inherit text-white">
              Sort By:
            </span>
            <Button
              className="rounded-none p-5"
              onClick={() => setSortCriteria("relevance")}
            >
              Relevance
            </Button>
            <Button
              className="rounded-none p-5"
              onClick={() => setSortCriteria("recent")}
            >
              Recent
            </Button>
            <Button
              className="rounded-none p-5"
              onClick={() => setSortCriteria("citations")}
            >
              Citations
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-1/6 ">
          <div className="flex flex-col gap-5">
            <span className="font-semibold m-auto">Filter By Type:</span>
            <Button
              className={`p-2 rounded-none m-auto w-36 ${
                filterType === "All"
                  ? "bg-blue-500 text-white hover:bg-blue-500"
                  : ""
              }`}
              onClick={() => setFilterType("All")}
            >
              All
            </Button>
            {uniqueTypes.map((type) => (
              <Button
                key={type}
                className={`p-2 rounded-none m-auto w-36 ${
                  filterType === type
                    ? "bg-blue-500 text-white hover:bg-blue-500"
                    : ""
                }`}
                onClick={() => setFilterType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-5/6 ">
          <ResearchWork
            researchItems={filteredItems}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SearchRepo;
