"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { useNotifications } from "@/app/dashboard/activity/UseNotifications";
import { useEffect, useState } from "react";
import { LuBell } from "react-icons/lu";

export const NotificationBadge = () => {
  const { user } = useAuth();
  const notifications = useNotifications(user?.uid || "");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  if (!user) return null;

  return (
    <div className="relative">
      <LuBell className="w-6 h-6 text-gray-400 hover:text-white" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
};
