// components/NotificationIcon.tsx
"use client";

import { LuMessagesSquare } from "react-icons/lu";

interface NotificationIconProps {
  type: string;
  isRead: boolean;
}

export default function NotificationIcon({
  type,
  isRead,
}: NotificationIconProps) {
  const iconClass = `w-8 h-8 p-1.5 rounded-full ${
    isRead ? "text-gray-400 bg-gray-700" : "text-white bg-blue-500"
  }`;

  return <LuMessagesSquare className={iconClass} />;
}
