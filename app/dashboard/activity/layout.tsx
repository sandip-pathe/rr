"use client";

import Layout from "@/components/Layout";
import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./UseNotifications";
import { useAuth } from "@/app/auth/AuthContext";
import NotificationSidebar from "./NotificationSidebar";
import DefaultNotificationContent from "./DefaultNotificationContent";
import { Notification } from "@/types/Notification";
import NotificationTester from "./test";

export default function MessagesLayout({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { notifications, loading: notificationsLoading } = useNotifications(
    user?.uid ?? ""
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (notifications.length > 0 && !selectedNotification) {
      setSelectedNotification(notifications[0]);
    }
  }, [notifications, selectedNotification]);

  const handleNotificationClick = async (notification: Notification) => {
    setActionLoading(true);
    setSelectedNotification(notification);

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      if (notification.link) {
        router.push(notification.link);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      await markAllNotificationsAsRead(user.uid);
    } finally {
      setActionLoading(false);
    }
  };

  const isLoading = notificationsLoading || actionLoading;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-48px)] overflow-hidden bg-[#1e1e1e]">
        <div className="w-1/3 min-h-screen scrollbar overflow-y-auto">
          <NotificationSidebar
            notifications={notifications}
            selectedNotification={selectedNotification}
            unreadCount={unreadCount}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            onMarkAllAsRead={handleMarkAllAsRead}
            onMarkAsRead={() => {}}
            onToggleMute={() => {}}
          />
        </div>
        <div className="w-2/3 overflow-y-auto scrollbar-hide">{children}</div>
      </div>
    </Layout>
  );
}
