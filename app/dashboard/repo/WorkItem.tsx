// WorkItem.tsx (new component)
"use client";

import { BsPersonCircle } from "react-icons/bs";

import { ResearchItem } from "@/types/ResearchWork";

interface WorkItemProps {
  item: ResearchItem;
  searchQuery: string;
  onSelect: (item: ResearchItem) => void;
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-yellow-200">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const WorkItem = ({ item, searchQuery, onSelect }: WorkItemProps) => {
  return (
    <div className="pt-5 gap-2 flex flex-col">
      <h2
        className="text-lg font-bold line-clamp-2 hover:underline cursor-pointer"
        onClick={() => onSelect(item)}
      >
        {highlightText(item.title, searchQuery)}
      </h2>
      <p className="line-clamp-2 text-sm text-gray-400">
        {highlightText(item.description, searchQuery)}
      </p>
      <div className="flex flex-row justify-start text-sm flex-wrap gap-3">
        <span className="bg-cyan-600 px-2">
          {item.isProject ? "Project" : item.type}
        </span>
        <span>{item.date}</span>
        {!item.isProject && item.reads && item.reads > 0 && (
          <span>{item.reads} reads</span>
        )}
        {!item.isProject && item.citations && item.citations > 0 && (
          <span>{item.citations} citations</span>
        )}
        {item.isProject && (
          <span className="bg-green-600 px-2">{item.status}</span>
        )}
      </div>

      <div className="flex flex-row flex-wrap overflow-hidden max-h-16">
        {item.authors?.map((author, id) => (
          <span
            key={id}
            className="flex flex-row items-center gap-1 mr-3"
            onClick={() => {}}
          >
            <BsPersonCircle />
            <span>{highlightText(author.name, searchQuery)}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-row justify-between">
        <span className="text-blue-400 cursor-pointer">
          {item.isProject ? "View Details" : "Request full text"}
        </span>
        <span className="flex flex-row gap-3">
          <span className="cursor-pointer text-cyan-300">Like</span>
          <span className="cursor-pointer text-cyan-300">Share</span>
          <span className="cursor-pointer text-cyan-300">Save</span>
        </span>
      </div>
      <div className="shadow-md border-b pt-5 border-gray-600" />
    </div>
  );
};

export default WorkItem;
