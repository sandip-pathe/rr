"use client";

import Layout from "@/components/Layout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, markNotificationAsRead } from "./UseNotifications";
import { useAuth } from "@/app/auth/AuthContext";
import { LuMessagesSquare } from "react-icons/lu";
import { usePageHeading } from "@/app/auth/PageHeadingContext";

const MsgLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const notifications = useNotifications(user?.uid!);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const router = useRouter();
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

  const handleNotificationClick = async (notification: any) => {
    setSelectedNotification(notification);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

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
        <div className="w-1/3 p-2 bg-[#1a1b1b]">
          <h1 ref={headingRef} className="text-2xl font-semibold text-gray-300">
            Activities
          </h1>
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
        <div className="w-2/3 overflow-hidden">{children}</div>
      </div>
    </Layout>
  );
};

export default MsgLayout;
