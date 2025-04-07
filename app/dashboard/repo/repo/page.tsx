"use client";

import React, { useEffect, useRef, useState } from "react";
import ResearchWork from "../ResearchWork";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { DiscoverTabs } from "../Tabs";

interface ResearchItem {
  title: string;
  type: string;
  date: string;
  reads: number;
  citations: number;
  authors?: Author[];
  doi?: string;
  description: string;
  publishedIn: string;
  publisher: string;
  location: string;
  edition: string;
  futureScope: string;
}

interface Author {
  id: string;
  name: string;
}

const SearchRepo = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("relevance");
  const [filterType, setFilterType] = useState<string>("All");
  const [researchPapers, setResearchPapers] = useState<ResearchItem[]>([]);
  const [heading, setHeading] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchWorks = async () => {
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
          };
        });

        setResearchPapers(worksList);
      } catch (error) {
        console.error("Error fetching research works:", error);
      }
    };

    fetchWorks();
  }, []);

  const sortedItems = [...researchPapers].sort((a, b) => {
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
    new Set(researchPapers.map((item) => item.type))
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
    const typeMatch = filterType === "All" || item.type === filterType; // Match exact type

    return (titleMatch || authorMatch || abstractMatch) && typeMatch;
  });

  useEffect(() => {
    if (!headingRef.current) return;
    setHeading(headingRef.current.innerText);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(headingRef.current);
    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, [setHeading, setIsVisible]);

  return (
    <Layout>
      <DiscoverTabs />
      <h1
        ref={headingRef}
        className="text-2xl font-semibold text-gray-300 ml-10 mt-5"
      >
        Research Repository
      </h1>
      <div className="flex flex-row">
        <div className="w-1/6"></div>
        <div className="mt-5 w-1/2 ">
          <input
            type="text"
            className="p-2 w-full border border-gray-300 rounded"
            placeholder="Search by title or author"
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
