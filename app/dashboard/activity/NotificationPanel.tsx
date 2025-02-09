"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, markNotificationAsRead } from "./UseNotifications";
import { useAuth } from "@/app/auth/AuthContext";
import { LuMessagesSquare } from "react-icons/lu";

const NotificationPanel = () => {
  const { user } = useAuth();
  const notifications = useNotifications(user?.uid!);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const router = useRouter();

  const handleNotificationClick = async (notification: any) => {
    setSelectedNotification(notification);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-1/3 p-2 bg-[#1a1b1b]">
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 border border-transparent cursor-pointer mb-2 ${
                selectedNotification?.id === notification.id
                  ? "bg-[#252525] border rounded-sm shadow-sm border-gray-500"
                  : ""
              } ${!notification.isRead ? "font-bold" : "opacity-70"}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10">
                  <LuMessagesSquare className="w-10 h-10 text-black bg-blue-400 p-1" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <span className="text-xs">
                    {notification.createdAt?.toDate().toLocaleString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationPanel;
