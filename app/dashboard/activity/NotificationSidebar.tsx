"use client";

import {
  LuCheck,
  LuChevronRight,
  LuBellOff,
  LuBell,
  LuMessagesSquare,
} from "react-icons/lu";
import { MdChatBubble, MdDashboard } from "react-icons/md";
import { FcWorkflow } from "react-icons/fc";
import { Notification } from "@/types/Notification";
import Link from "next/link";
import { FaChevronCircleRight } from "react-icons/fa";
import { getLastSeenText } from "@/components/DateFormat";

interface NotificationSidebarProps {
  notifications: Notification[];
  selectedNotification: Notification | null;
  unreadCount: number;
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onToggleMute: (id: string) => void;
}

const NotificationIcon = ({
  type,
  isRead,
}: {
  type: string;
  isRead: boolean;
}) => {
  const iconProps = {
    className: `text-xl ${isRead ? "text-gray-400" : "text-blue-500"}`,
    size: 20,
  };

  switch (type.toLowerCase()) {
    case "message":
    case "chat":
      return <MdChatBubble {...iconProps} />;
    case "project":
      return <MdDashboard {...iconProps} />;
    case "board":
      return <FcWorkflow {...iconProps} />;
    case "ama":
      return <LuMessagesSquare {...iconProps} />;
    default:
      return <MdChatBubble {...iconProps} />;
  }
};

export default function NotificationSidebar({
  notifications,
  selectedNotification,
  unreadCount,
  isLoading,
  onNotificationClick,
  onMarkAllAsRead,
  onMarkAsRead,
  onToggleMute,
}: NotificationSidebarProps) {
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
  };

  return (
    <div className="p-4 bg-[#1a1b1b] border-r border-gray-800 overflow-y-auto scrollbar-hide min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-300">
          Activities{" "}
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            disabled={isLoading}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <LuCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No notifications yet
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 rounded-lg transition-colors ${
                selectedNotification?.id === notification.id
                  ? "bg-[#252525] border border-gray-600 shadow-sm"
                  : "hover:bg-[#222]"
              } ${!notification.isRead ? "bg-[#1e1e1e]" : "opacity-90"}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 gap-2 flex flex-col items-center">
                  <NotificationIcon
                    type={notification.type}
                    isRead={notification.isRead}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMute(notification.id);
                    }}
                    className="text-gray-400 hover:text-gray-300"
                    title={notification.muted ? "Unmute" : "Mute"}
                  >
                    {notification.muted ? (
                      <LuBellOff size={18} />
                    ) : (
                      <LuBell size={18} />
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p
                      className={`text-sm ${
                        !notification.isRead ? "font-medium" : ""
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>
                  <div className="mt-1 text-xs text-gray-400 space-y-1">
                    <div>
                      {notification.createdAt?.toDate()
                        ? getLastSeenText(notification.createdAt)
                        : "Just now"}
                    </div>
                    {notification.type === "message" && (
                      <div className="line-clamp-1 text-xs text-gray-300">
                        {notification.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="justify-center items-center flex-shrink-0 my-auto">
                  <Link
                    href={notification.link}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-200 hover:text-blue-500"
                  >
                    <FaChevronCircleRight size={30} />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
