import React from "react";
import { CgClose } from "react-icons/cg";
import { BsPersonCircle } from "react-icons/bs";
import { ResearchItem } from "@/types/ResearchWork";

interface SidebarProps {
  item: ResearchItem | null;
  onClose: () => void;
}

const ProjectDetailSidebar = ({ item, onClose }: SidebarProps) => {
  if (!item) return null;
  return (
    <div className="h-full text-white bg-transparent z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex space-x-4">
          <button className="text-lg font-semibold text-white focus:outline-none">
            Info
          </button>
          <button className="text-lg font-semibold text-gray-400 hover:text-white focus:outline-none">
            Related
          </button>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Sidebar"
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <CgClose className="w-8 h-8" />
        </button>
      </div>

      <div className="p-6 gap-6 flex flex-col">
        {/* Title and basic info */}
        <header>
          <h2 className="text-2xl font-bold text-white">{item.title}</h2>
          <div className="mt-2 text-sm text-gray-300 space-x-2">
            <span>{item.type}</span>
            <span>{item.publishedIn}</span>
            <span>{item.publisher}</span>
            <span>{item.location}</span>
            <span>{item.edition}</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Published on: {item.date}
          </p>
        </header>

        {/* Description Section */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-2">
            Abstract / Description
          </h3>
          <p className="text-base text-gray-200 text-justify">
            {item.description}
          </p>
        </section>

        {/* Reads, Citations, and DOI */}
        <section className="flex flex-col space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-semibold">Reads:</span> {item.reads}
          </p>
          <p>
            <span className="font-semibold">Citations:</span> {item.citations}
          </p>
          {item.doi && (
            <p>
              <span className="font-semibold">DOI:</span>{" "}
              <a
                href={`https://doi.org/${item.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {item.doi}
              </a>
            </p>
          )}
        </section>

        {/* Authors Section */}
        {item.authors && item.authors.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Authors</h3>
            <ul className="space-y-2">
              {item.authors.map((author) => (
                <li
                  key={author.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-blue-400"
                  onClick={() => console.log(`Author ID: ${author.id}`)}
                >
                  <BsPersonCircle className="w-6 h-6" />
                  <span>{author.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Future Work Section */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-2">Future Work</h3>
          <p className="text-sm text-gray-200 text-justify">
            {item.futureScope}
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProjectDetailSidebar;
