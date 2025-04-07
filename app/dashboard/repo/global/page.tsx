"use client";

import { useState } from "react";
import type { NextPage } from "next";
import Layout from "@/components/Layout";
import { DiscoverTabs } from "../Tabs";
import {
  BookOpenText,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Link,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { BsFillBuildingFill } from "react-icons/bs";

interface Innovation {
  title: string;
  description: string;
  source: string;
  url: string;
  tags: string[];
  date?: string;
  stars?: number; // For GitHub projects
  citations?: number; // For research papers
}

interface MarketInsights {
  marketSize: string;
  growthRate: string;
  keyPlayers: string[];
  positiveTrends: string[];
  negativeTrends: string[];
  reports: {
    source: string;
    title: string;
    url: string;
  }[];
  predictions: string[];
}

const InnovationSearch: NextPage = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Enhanced dummy data with more fields
  const dummyData: Record<string, Innovation[]> = {
    "open-source robotics projects this month": [
      {
        title: "TinyBot: A Millimeter-Scale Robot",
        description:
          "Open-source miniature robot for pipeline inspection with advanced swarm capabilities.",
        source: "GitHub",
        url: "https://github.com/example/tinybot",
        tags: ["robotics", "open-source", "hardware"],
        date: "2024-05-15",
        stars: 1243,
      },
      {
        title: "ROS2 Navigation Stack",
        description:
          "Community-maintained navigation stack for ROS2 robots with improved SLAM algorithms.",
        source: "GitHub",
        url: "https://github.com/example/ros2-nav",
        tags: ["robotics", "open-source", "ROS"],
        date: "2024-05-10",
        stars: 876,
      },
    ],
    "stanford innovations in AI for health": [
      {
        title: "AI for Early Cancer Detection",
        description:
          "Stanford researchers developed an AI model that detects early signs of pancreatic cancer with 94% accuracy.",
        source: "Stanford University",
        url: "https://med.stanford.edu/ai-cancer",
        tags: ["AI", "health", "research"],
        date: "2024-04-28",
        citations: 142,
      },
      {
        title: "Mental Health Chatbot",
        description:
          "AI-powered chatbot providing mental health support with CBT techniques, developed at Stanford.",
        source: "Stanford University",
        url: "https://stanford.edu/ai-mental-health",
        tags: ["AI", "mental-health", "chatbot"],
        date: "2024-05-05",
        citations: 87,
      },
    ],
  };

  // Market insights dummy data
  const marketInsightsData: Record<string, MarketInsights> = {
    robotics: {
      marketSize: "$43.32 billion (2023)",
      growthRate: "17% CAGR (2024-2030)",
      keyPlayers: ["Boston Dynamics", "iRobot", "ABB", "Fanuc", "KUKA"],
      positiveTrends: [
        "Increased adoption in manufacturing",
        "Advancements in computer vision",
        "Growing demand for service robots",
      ],
      negativeTrends: [
        "High initial investment costs",
        "Regulatory challenges",
        "Skill gap in workforce",
      ],
      reports: [
        {
          source: "McKinsey & Company",
          title:
            "The Robotics Revolution: The Next Great Leap in Manufacturing",
          url: "https://www.mckinsey.com/robotics-report",
        },
        {
          source: "Statista",
          title: "Global Robotics Market Outlook 2024",
          url: "https://www.statista.com/robotics-market",
        },
      ],
      predictions: [
        "Service robots to dominate market share by 2027",
        "AI integration will drive 40% of robotics innovation by 2025",
        "Collaborative robots (cobots) to grow at 25% annually",
      ],
    },
    "AI for health": {
      marketSize: "$20.9 billion (2024)",
      growthRate: "36.4% CAGR (2024-2032)",
      keyPlayers: [
        "IBM Watson Health",
        "Google Health",
        "NVIDIA Healthcare",
        "DeepMind Health",
        "Tempus",
      ],
      positiveTrends: [
        "FDA approvals for AI diagnostics increasing",
        "Improved patient outcomes in clinical trials",
        "Cost reductions in healthcare delivery",
      ],
      negativeTrends: [
        "Data privacy concerns",
        "Regulatory hurdles slowing adoption",
        "Black box problem in clinical decision-making",
      ],
      reports: [
        {
          source: "PwC",
          title:
            "AI in Healthcare: Transforming Patient Care and Administration",
          url: "https://www.pwc.com/ai-healthcare",
        },
        {
          source: "CB Insights",
          title:
            "The AI in Healthcare Report: Investment Trends and Future Outlook",
          url: "https://www.cbinsights.com/ai-healthcare",
        },
      ],
      predictions: [
        "AI to automate 30% of administrative healthcare tasks by 2026",
        "Diagnostic AI to reach human-level accuracy in 5 specialties by 2025",
        "Global savings from AI in healthcare to exceed $150B annually by 2027",
      ],
    },
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMarketInsights(null);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find matching dummy data or return empty
      const lowerQuery = query.toLowerCase();
      let results: Innovation[] = [];
      let insights: MarketInsights | null = null;

      // Match innovations
      for (const key in dummyData) {
        if (lowerQuery.includes(key.toLowerCase())) {
          results = dummyData[key];
          break;
        }
      }

      // Match market insights based on topic
      if (lowerQuery.includes("robotics")) {
        insights = marketInsightsData["robotics"];
      } else if (
        lowerQuery.includes("health") ||
        lowerQuery.includes("medical")
      ) {
        insights = marketInsightsData["AI for health"];
      }

      if (results.length === 0) {
        results = [
          {
            title: "Sample Innovation 1",
            description: "This is a sample innovation description.",
            source: "GitHub",
            url: "https://example.com/1",
            tags: ["sample", "demo"],
            date: "2024-01-01",
          },
          {
            title: "Sample Innovation 2",
            description:
              "Another sample innovation for demonstration purposes.",
            source: "Stanford",
            url: "https://example.com/2",
            tags: ["demo", "test"],
            date: "2024-01-02",
          },
        ];
      }

      setInnovations(results);
      setMarketInsights(insights);
    } catch (err) {
      setError("Failed to fetch innovations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <DiscoverTabs />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Discover Innovations
            </h1>
            <p className="mt-3 text-xl text-gray-300">
              Find the latest research, projects, and tools with market insights
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 shadow-xl rounded-lg p-6 mb-8">
            <form onSubmit={handleSearch}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'Show me open-source robotics projects this month'"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-400">
                Try: "Find recent mental health tech projects", "What's trending
                in AI on GitHub?"
              </div>
            </form>
          </div>

          {error && (
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {marketInsights && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-gray-700">
                Industry Insights
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <BarChart2 className="h-6 w-6 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">
                      Market Overview
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Market Size</p>
                      <p className="text-white font-medium">
                        {marketInsights.marketSize}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Growth Rate</p>
                      <p className="text-white font-medium">
                        {marketInsights.growthRate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Key Players</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {marketInsights.keyPlayers.map((player, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 rounded-md text-sm text-gray-200"
                          >
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">
                      Trends & Predictions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center">
                        <TrendingUp className="mr-1 h-4 w-4" /> Positive Trends
                      </h4>
                      <ul className="space-y-2">
                        {marketInsights.positiveTrends.map((trend, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-300 flex"
                          >
                            <span className="text-green-400 mr-2">•</span>{" "}
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                        <TrendingDown className="mr-1 h-4 w-4" /> Challenges
                      </h4>
                      <ul className="space-y-2">
                        {marketInsights.negativeTrends.map((trend, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-300 flex"
                          >
                            <span className="text-red-400 mr-2">•</span> {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <BookOpenText className="h-6 w-6 text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">
                      Reports & Predictions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-purple-400 mb-2">
                        Industry Reports
                      </h4>
                      <div className="space-y-3">
                        {marketInsights.reports.map((report, index) => (
                          <div key={index} className="group">
                            <a
                              href={report.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start hover:bg-gray-700/50 rounded p-2 transition-colors"
                            >
                              <Link className="h-4 w-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {report.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {report.source}
                                </p>
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-2">
                        Future Predictions
                      </h4>
                      <ul className="space-y-3">
                        {marketInsights.predictions.map((prediction, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-300 flex"
                          >
                            <span className="text-yellow-400 mr-2">•</span>{" "}
                            {prediction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {innovations.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-gray-700">
                Innovations
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {innovations.map((innovation, index) => (
                  <InnovationCard key={index} innovation={innovation} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const InnovationCard: React.FC<{ innovation: Innovation }> = ({
  innovation,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <SourceIcon source={innovation.source} />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                <a
                  href={innovation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  {innovation.title}
                </a>
              </h3>
              {innovation.date && (
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {new Date(innovation.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{innovation.source}</p>
            <p className="text-gray-300 mt-3">{innovation.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {innovation.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-400 space-x-4">
              {innovation.stars !== undefined && (
                <span className="flex items-center">
                  <svg
                    className="h-4 w-4 text-yellow-400 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {innovation.stars.toLocaleString()}
                </span>
              )}
              {innovation.citations !== undefined && (
                <span className="flex items-center">
                  <svg
                    className="h-4 w-4 text-purple-400 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {innovation.citations} citations
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-700/50 px-6 py-3">
        <div className="text-sm">
          <a
            href={innovation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-400 hover:text-blue-300 inline-flex items-center transition-colors"
          >
            View details
            <svg
              className="h-4 w-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

const SourceIcon: React.FC<{ source: string }> = ({ source }) => {
  const iconClass = "h-10 w-10 rounded-lg flex items-center justify-center";

  if (source.includes("GitHub")) {
    return (
      <div className={`${iconClass} bg-gray-900 text-white`}>
        <FiGithub className="h-6 w-6" />
      </div>
    );
  }

  if (source.includes("Stanford") || source.includes("University")) {
    return (
      <div className={`${iconClass} bg-red-900/50 text-red-400`}>
        <BsFillBuildingFill className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className={`${iconClass} bg-blue-900/50 text-blue-400`}>
      <BookOpenText className="h-6 w-6" />
    </div>
  );
};

export default InnovationSearch;
