// components/DefaultNotificationContent.tsx
"use client";

import { getLastSeenText } from "@/components/DateFormat";
import NotificationIcon from "./NotificationIcon";
import { Notification } from "@/types/Notification";

interface DefaultNotificationContentProps {
  notification: Notification | null;
}

export default function DefaultNotificationContent({
  notification,
}: DefaultNotificationContentProps) {
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
                  ? getLastSeenText(notification.createdAt)
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
}
