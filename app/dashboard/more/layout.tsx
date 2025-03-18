"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "../ama/helper";
import { usePageHeading } from "@/app/auth/PageHeadingContext";
import { MdAddComment } from "react-icons/md";

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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { setHeading, setIsVisible } = usePageHeading();

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
      <div className="flex h-screen">
        <div className="w-1/3 p-2 bg-[#1a1b1b] border-x border-gray-500 overflow-y-auto">
          <div className="flex flex-row items-center justify-between">
            <h1
              ref={headingRef}
              className="text-2xl font-bold text-gray-300 m-5"
            >
              Chats
            </h1>
            <MdAddComment className="text-3xl text-gray-300 cursor-pointer" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full self-center p-2 bg-[#252525] rounded-md mb-5"
          />
          <ul>
            {dummyChats.map((chat) => (
              <li
                key={chat.id}
                className={`p-2 mb-2 flex flex-row items-center cursor-pointer rounded-sm shadow-sm ${
                  chat.lastMessage ? "bg-[#252525]" : "font-bold opacity-70"
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
        <div className="w-2/3 overflow-hidden">{children}</div>
      </div>
    </Layout>
  );
};

export default MsgLayout;
