"use client";

import React, { useState } from "react";
import ResearchWork from "./ResearchWork";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

interface ResearchItem {
  title: string;
  type: string; // e.g., Article, Conference Paper
  date: string; // Publication date
  reads: number; // Number of reads
  citations: number; // Number of citations
  authors?: string[];
  abstract?: string;
  doi?: string;
}

const researchPapers: ResearchItem[] = [
  {
    title: "A Deep Learning Approach for Traffic Sign Recognition",
    type: "Conference Paper",
    date: "2022-05-15",
    reads: 3421,
    citations: 45,
    authors: ["John Doe", "Emily Smith", "Michael Zhang"],
    abstract:
      "This paper presents a deep learning-based model for traffic sign recognition using convolutional neural networks (CNN). The model is trained on a large-scale dataset and demonstrates significant improvements in accuracy and computational efficiency compared to traditional methods.",
    doi: "10.1109/ICTAI.2022.00059",
  },
  {
    title: "Quantum Computing: A Comprehensive Review",
    type: "Article",
    date: "2021-07-01",
    reads: 1984,
    citations: 78,
    authors: ["Alice Johnson", "Robert Brown"],
    abstract:
      "This review explores the principles and potential applications of quantum computing in cryptography, material science, and artificial intelligence. We discuss current advancements and challenges in the field, as well as its future impact on computational power.",
    doi: "10.1038/s41534-021-00014",
  },
  {
    title: "Blockchain in Healthcare: Opportunities and Challenges",
    type: "Article",
    date: "2023-03-22",
    reads: 4315,
    citations: 110,
    authors: ["Daniel Lee", "Sophia Davis"],
    abstract:
      "Blockchain technology has gained attention for its potential to revolutionize the healthcare industry. This paper examines its application in electronic medical records, drug supply chain management, and clinical trials, highlighting benefits and challenges.",
    doi: "10.1016/j.jbi.2023.101123",
  },
  {
    title: "AI-Based Image Enhancement for Medical Diagnostics",
    type: "Conference Paper",
    date: "2022-10-11",
    reads: 2765,
    citations: 62,
    authors: ["Helen Carter", "Raj Patel", "Maria Gonzalez"],
    abstract:
      "This study investigates the use of AI-driven image processing techniques to enhance medical diagnostics. By applying generative adversarial networks (GANs), the paper demonstrates improvements in image quality and diagnostic accuracy in radiology.",
    doi: "10.1109/ICPR.2022.00742",
  },
  {
    title: "Environmental Impacts of Autonomous Vehicles",
    type: "Article",
    date: "2020-08-30",
    reads: 3689,
    citations: 93,
    authors: ["Paul White", "Isabella Green"],
    abstract:
      "Autonomous vehicles (AVs) are expected to disrupt transportation systems. This paper discusses the environmental implications of AV deployment, focusing on energy consumption, emissions, and urban planning. It presents a lifecycle analysis comparing AVs to conventional vehicles.",
    doi: "10.1016/j.tra.2020.06.015",
  },
  {
    title: "Neural Networks for Real-Time Speech Translation",
    type: "Conference Paper",
    date: "2021-09-05",
    reads: 1598,
    citations: 54,
    authors: ["Laura Wilson", "Benjamin Harris"],
    abstract:
      "This paper presents a novel approach to real-time speech translation using recurrent neural networks (RNNs) and attention mechanisms. The system achieves low-latency, high-accuracy translation across multiple languages, providing real-time translation in multilingual settings.",
    doi: "10.1145/3457205.3472875",
  },
  {
    title: "Smart Agriculture: IoT-Based Crop Monitoring Systems",
    type: "Article",
    date: "2021-11-17",
    reads: 2956,
    citations: 70,
    authors: ["Anthony Baker", "Jessica Thompson"],
    abstract:
      "Smart agriculture leverages IoT devices for real-time crop monitoring. This paper presents an IoT-based system that monitors soil moisture, temperature, and crop health, providing predictive analytics for farmers to optimize crop yield and reduce resource usage.",
    doi: "10.3390/smartag.2021.890654",
  },
  {
    title: "Cybersecurity in the Age of Internet of Things",
    type: "Article",
    date: "2023-01-25",
    reads: 5123,
    citations: 132,
    authors: ["Kevin Lee", "Anna Parker"],
    abstract:
      "This paper explores the challenges posed by the proliferation of IoT devices in terms of cybersecurity. It outlines attack vectors, security protocols, and future directions for enhancing the security of interconnected devices and systems.",
    doi: "10.1109/ACCESS.2023.301234",
  },
  {
    title: "Human-Robot Interaction in Collaborative Environments",
    type: "Conference Paper",
    date: "2020-06-10",
    reads: 2339,
    citations: 49,
    authors: ["David Wright", "Laura Moore"],
    abstract:
      "This paper explores human-robot interaction (HRI) in collaborative environments such as manufacturing and healthcare. We present case studies and propose a novel framework for improving communication and collaboration between humans and robots.",
    doi: "10.1109/HRI.2020.00123",
  },
  {
    title: "Big Data Analytics for Predictive Maintenance",
    type: "Article",
    date: "2022-04-07",
    reads: 4175,
    citations: 125,
    authors: ["Oliver Clark", "Samantha Lewis"],
    abstract:
      "This paper demonstrates the application of big data analytics for predictive maintenance in industrial settings. Using machine learning algorithms, the system predicts equipment failures and optimizes maintenance schedules, reducing downtime and operational costs.",
    doi: "10.1007/s11063-022-10012",
  },
];

const SearchRepo = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("relevance");
  const [filterType, setFilterType] = useState<string>("All");

  // Sorting logic
  const sortedItems = [...researchPapers].sort((a, b) => {
    switch (sortCriteria) {
      case "recent":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "citations":
        return b.citations - a.citations;
      default:
        return 0; // Default relevance sorting
    }
  });

  // Filtering logic
  const filteredItems = sortedItems.filter((item) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(lowerSearchQuery);
    const abstractMatch = item.abstract
      ?.toLowerCase()
      .includes(lowerSearchQuery);
    const authorMatch = item.authors?.some((author) =>
      author.toLowerCase().includes(lowerSearchQuery)
    );
    const typeMatch =
      filterType === "All" ||
      item.type.toLowerCase() === filterType.toLowerCase();

    return (titleMatch || authorMatch || abstractMatch) && typeMatch;
  });

  return (
    <Layout>
      <div className="">
        <div className="flex flex-row">
          <div className="w-1/6"></div>
          <div className="mt-5 w-1/2">
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
          <div className="w-1/6">
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
              <Button
                className={`p-2 rounded-none m-auto w-36 ${
                  filterType === "Conference Paper"
                    ? "bg-blue-500 text-white hover:bg-blue-500"
                    : ""
                }`}
                onClick={() => setFilterType("Conference Paper")}
              >
                Conference Papers
              </Button>
              <Button
                className={`p-2 rounded-none m-auto w-36 ${
                  filterType === "Article"
                    ? "bg-blue-500 text-white hover:bg-blue-500"
                    : ""
                }`}
                onClick={() => setFilterType("Article")}
              >
                Journal Articles
              </Button>
            </div>
          </div>
          <div className="w-5/6">
            <ResearchWork
              researchItems={filteredItems}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchRepo;
