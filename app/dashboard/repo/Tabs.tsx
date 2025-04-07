"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiFolder,
  FiBriefcase,
  FiCodesandbox,
  FiMic,
  FiGlobe,
} from "react-icons/fi";

const tabs = [
  {
    name: "Repository",
    path: "/dashboard/repo/repo",
    icon: <FiFolder className="h-4 w-4" />,
  },
  {
    name: "Internships",
    path: "/dashboard/repo/internships",
    icon: <FiBriefcase className="h-4 w-4" />,
  },
  {
    name: "Problem Statements",
    path: "/dashboard/repo/problem",
    icon: <FiCodesandbox className="h-4 w-4" />,
  },
  {
    name: "Open Projects",
    path: "/dashboard/repo/open",
    icon: <FiCodesandbox className="h-4 w-4" />,
  },
  {
    name: "Opportunities",
    path: "/dashboard/repo/opportunities",
    icon: <FiMic className="h-4 w-4" />,
  },
  {
    name: "Global Projects",
    path: "/dashboard/repo/global",
    icon: <FiGlobe className="h-4 w-4" />,
  },
];

export function DiscoverTabs() {
  const pathname = usePathname();

  return (
    <div className="inline-flex h-12 items-center justify-between bg-[#252525] px-10 text-muted-foreground w-full">
      <nav className="grid w-full grid-cols-6 gap-5">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`
              inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background
              transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              disabled:pointer-events-none disabled:opacity-50
              ${
                pathname === tab.path
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.name}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
