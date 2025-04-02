"use client";

import Layout from "@/components/Layout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, markNotificationAsRead } from "./UseNotifications";
import { useAuth } from "@/app/auth/AuthContext";
import { LuMessagesSquare, LuCheck, LuChevronRight } from "react-icons/lu";
import { usePageHeading } from "@/app/auth/PageHeadingContext";
import { Notification } from "@/types/Notification";
import { formatDistanceToNow } from "date-fns";
import { markAllNotificationsAsRead } from "./UseNotifications";

const MsgLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const notifications = useNotifications(user?.uid!);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { setHeading, setIsVisible } = usePageHeading();
  const [isLoading, setIsLoading] = useState(false);

  // Track unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Set up intersection observer for the heading
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

  // Auto-select the first notification if none is selected
  useEffect(() => {
    if (notifications.length > 0 && !selectedNotification) {
      setSelectedNotification(notifications[0]);
    }
  }, [notifications]);

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsLoading(true);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    setIsLoading(false);
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllNotificationsAsRead(user?.uid!);
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="flex h-screen">
        {/* Notifications sidebar */}
        <div className="w-1/3 p-4 bg-[#1a1b1b] border-r border-gray-800 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1
              ref={headingRef}
              className="text-2xl font-semibold text-gray-300"
            >
              Activities{" "}
              {unreadCount > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <LuCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No notifications yet
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNotification?.id === notification.id
                      ? "bg-[#252525] border border-gray-600 shadow-sm"
                      : "hover:bg-[#222]"
                  } ${!notification.isRead ? "bg-[#1e1e1e]" : "opacity-90"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <NotificationIcon
                        type={notification.type}
                        isRead={notification.isRead}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          !notification.isRead ? "font-medium" : ""
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">
                          {notification.createdAt?.toDate()
                            ? formatDistanceToNow(
                                notification.createdAt.toDate(),
                                { addSuffix: true }
                              )
                            : "Just now"}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                    </div>
                    <LuChevronRight className="text-gray-500 flex-shrink-0 mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notification content area */}
        <div className="w-2/3 overflow-y-auto bg-[#1e1e1e]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            children || (
              <DefaultNotificationContent notification={selectedNotification} />
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

const NotificationIcon = ({
  type,
  isRead,
}: {
  type: string;
  isRead: boolean;
}) => {
  const iconClass = `w-8 h-8 p-1.5 rounded-full ${
    isRead ? "text-gray-400 bg-gray-700" : "text-white bg-blue-500"
  }`;

  switch (type) {
    case "message":
      return <LuMessagesSquare className={iconClass} />;
    case "project":
      return <LuMessagesSquare className={iconClass} />;
    case "task":
      return <LuMessagesSquare className={iconClass} />;
    case "community":
      return <LuMessagesSquare className={iconClass} />;
    default:
      return <LuMessagesSquare className={iconClass} />;
  }
};

const DefaultNotificationContent = ({
  notification,
}: {
  notification: Notification | null;
}) => {
  if (!notification) {
    return (
      <div className="h-full flex justify-center items-center">
        <p className="text-gray-500 text-xl">
          Select a notification to view details
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <NotificationIcon
            type={notification.type}
            isRead={notification.isRead}
          />
          <h2 className="text-xl font-semibold text-gray-200">
            {notification.message}
          </h2>
        </div>

        <div className="bg-[#252525] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Type</p>
              <p className="text-gray-200 capitalize">{notification.type}</p>
            </div>
            <div>
              <p className="text-gray-400">Received</p>
              <p className="text-gray-200">
                {notification.createdAt?.toDate()
                  ? formatDistanceToNow(notification.createdAt.toDate(), {
                      addSuffix: true,
                    })
                  : "Recently"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              if (notification.link) {
                window.location.href = notification.link;
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Go to {notification.type}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MsgLayout;
