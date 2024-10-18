"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";
import { FaSchool } from "react-icons/fa";
import { LuMessagesSquare } from "react-icons/lu";

const dummyData = [
  {
    id: 1,
    dueDate: "Due October 26",
    date: "19/10",
    activity: "Sent Message | This is a new message from me",
    author: "Lathish Rai",
    reference: "Machine Learning Team with the new reference data",
  },
  {
    id: 2,
    dueDate: "Due October 15",
    date: "15/10",
    activity: "Sent Message | This is a new message from me",
    author: "Lathish Rai",
    reference: "Research Team",
  },
  {
    id: 3,
    dueDate: "Due October 12",
    date: "10/10",
    activity: "Sent Message | This is a new message from me",
    author: "Lathish Rai",
    reference: "Research Team",
  },
];

const NotificationPanel = () => {
  const [selectedNotification, setSelectedNotification] = useState(
    dummyData[0]
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left-side panel */}
      <div className="w-1/4 p-2 bg-[#1a1b1b]">
        <ul className="p-0">
          {dummyData.map((notification) => (
            <li
              className={` p-4 border border-transparent cursor-pointer mb-2 ${
                selectedNotification.id === notification.id
                  ? "bg-[#252525] border rounded-sm shadow-sm border-gray-500"
                  : ""
              } `}
              key={notification.id}
              onClick={() => setSelectedNotification(notification)}
            >
              <div className="flex flex-row h-14 gap-2 justify-between p-0">
                <div className="w-10 h-10">
                  <LuMessagesSquare className="w-10 h-10 text-black bg-blue-400 p-1" />
                </div>
                <div className="flex flex-col gap-1 justify-start">
                  <div className="line-clamp-2 text-sm font-normal">
                    {notification.author} {notification.activity}
                  </div>
                  <div className="text-xs font-thin">
                    {notification.dueDate}
                  </div>
                </div>
                <div className="p-0 m-0">{notification.date}</div>
              </div>
              <div className="ml-12 line-clamp-1">{notification.reference}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationPanel;
