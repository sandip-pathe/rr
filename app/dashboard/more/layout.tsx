"use client";

import React from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "../ama/helper";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

const dummyChats: Chat[] = [
  {
    id: "chat1",
    name: "Alice Johnson",
    lastMessage: "Hey, are we still on for the meeting?",
    timestamp: "2025-02-09T10:30:00Z",
  },
  {
    id: "chat2",
    name: "Bob Smith",
    lastMessage: "I have updated the project docs.",
    timestamp: "2025-02-09T09:15:00Z",
  },
  {
    id: "chat3",
    name: "Charlie Brown",
    lastMessage: "Can we catch up later today?",
    timestamp: "2025-02-08T15:45:00Z",
  },
];

const MsgLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      <div className="flex h-screen">
        <div className="w-1/3 p-2 bg-[#1a1b1b]">
          <h1 className="text-xl font-bold text-white">Chats</h1>
          <ul>
            {dummyChats.map((chat) => (
              <li
                key={chat.id}
                className={`p-2 mb-2 flex flex-row items-center cursor-pointer rounded-sm shadow-sm ${
                  chat.lastMessage
                    ? "bg-[#252525] border border-gray-500"
                    : "font-bold opacity-70"
                }`}
              >
                <Link
                  href={`/dashboard/more/${chat.id}`}
                  className="flex w-full items-center"
                >
                  <Avatar className="h-10 w-10 m-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row items-center justify-between">
                      <h2 className="text-base font-bold max-w-[70%] line-clamp-1">
                        {chat.name}
                      </h2>
                      <span className="text-xs text-blue-400 line-clamp-1">
                        {formatDate(chat.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {chat.lastMessage}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 overflow-scroll overflow-y-auto">{children}</div>
      </div>
    </Layout>
  );
};

export default MsgLayout;
