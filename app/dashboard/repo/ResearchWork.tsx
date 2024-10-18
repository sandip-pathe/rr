import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProjectDetailSidebar from "./DetailedSidebar";

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
      <div className="w-2/3">
        <Card className="bg-[#252525] border-0 rounded-none">
          <CardContent>
            <ul>
              {researchItems.map((item, index) => (
                <li
                  key={index}
                  className="pt-5 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <h2 className="text-lg font-bold">
                    {highlightText(item.title, searchQuery)}
                  </h2>
                  <div>
                    <span>
                      IGARSS 2024 - 2024 IEEE International Geoscience
                    </span>
                  </div>

                  <div className="flex flex-row gap-2">
                    {item.authors?.map((author, index) => (
                      <span
                        key={index}
                        className="flex flex-row items-center gap-2"
                      >
                        {"• "}
                        {highlightText(author, searchQuery)}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-row justify-between">
                    <span className="border border-cyan-300 rounded-full px-2">
                      Request full text
                    </span>
                    <span>Like · Save · Recommend</span>
                  </div>
                  <div className="shadow-md border-b pt-5 border-gray-500" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {selectedItem && (
        <div className="w-1/3">
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
