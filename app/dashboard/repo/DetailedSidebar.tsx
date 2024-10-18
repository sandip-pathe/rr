import React from "react";
import { Button } from "@/components/ui/button";
import { CgClose } from "react-icons/cg";

interface ResearchItem {
  title: string;
  type: string;
  date: string;
  reads: number;
  citations: number;
  authors?: string[];
  abstract?: string;
  doi?: string;
}

interface SidebarProps {
  item: ResearchItem | null;
  onClose: () => void;
}

const ProjectDetailSidebar = ({ item, onClose }: SidebarProps) => {
  if (!item) return null;

  return (
    <div className="h-full bg-inherit text-white">
      <div className="flex flex-row w-full justify-between gap-5 px-6 py-2 border-b border-white">
        <div className="text-lg font-semibold">Info</div>
        <div className="text-lg font-semibold">Related</div>
        <span
          onClick={onClose}
          className="bg-inherit p-0 text-gray-400 ml-auto"
        >
          <CgClose className="w-8 h-8" />
        </span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{item.title}</h2>
        </div>
        <p className="text-sm text-gray-400">{item.date}</p>
        <div className="mt-4">
          <p className="text-lg">Authors:</p>
          <ul className="list-disc list-inside">
            {item.authors?.map((author, index) => (
              <li key={index}>{author}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <p className="text-lg font-semibold">Abstract:</p>
          <p>{item.abstract}</p>
        </div>
        <div className="mt-4">
          <p>Reads: {item.reads}</p>
          <p>Citations: {item.citations}</p>
        </div>
        <div className="mt-4">
          <p>
            DOI:{" "}
            <a
              href={`https://doi.org/${item.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              {item.doi}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailSidebar;
