import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProjectDetailSidebar from "./DetailedSidebar";
import { BsPersonCircle } from "react-icons/bs";

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

interface ActivityProps {
  researchItems: ResearchItem[];
}

const ResearchWork = ({
  researchItems,
  searchQuery,
}: ActivityProps & { searchQuery: string }) => {
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-blue-500">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-row">
      <div className="w-3/5">
        <Card className="bg-[#252525] border-0 rounded-none">
          <CardContent>
            <ul>
              {researchItems.map((item, index) => (
                <li key={index} className="pt-5 gap-2 flex flex-col">
                  <h2
                    className="text-lg font-bold line-clamp-2 hover:underline cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {highlightText(item.title, searchQuery)}
                  </h2>
                  <p className="line-clamp-2 text-sm text-gray-400">
                    {highlightText(item.description, searchQuery)}
                  </p>
                  <div className="flex flex-row justify-start text-sm flex-wrap gap-3">
                    <span className="bg-cyan-600 px-2">{item.type}</span>
                    <span>{item.date}</span>
                    {item.reads > 0 && <span>{item.reads} reads</span>}
                    {item.reads > 0 && <span>{item.citations} citations</span>}
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
                      Request full text
                    </span>
                    <span className="flex flex-row gap-3">
                      <span className="cursor-pointer text-cyan-300">Like</span>
                      <span className="cursor-pointer text-cyan-300">
                        Share
                      </span>
                      <span className="cursor-pointer text-cyan-300">Save</span>
                    </span>
                  </div>
                  <div className="shadow-md border-b pt-5 border-gray-600" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {selectedItem && (
        <div className="w-2/5">
          <ProjectDetailSidebar
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ResearchWork;
