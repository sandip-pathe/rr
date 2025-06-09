// Updated NotificationSidebar.tsx (relevant part for improved UI)

import { LuCheck, LuBellOff, LuBell, LuMessagesSquare } from "react-icons/lu";
import { MdChatBubble, MdDashboard } from "react-icons/md";
import { FcWorkflow } from "react-icons/fc";
import { Notification } from "@/types/Notification";
import { getLastSeenText } from "@/components/DateFormat";

const NotificationIcon = ({
  type,
  isRead,
}: {
  type: string;
  isRead: boolean;
}) => {
  const baseClasses =
    "w-10 h-10 flex items-center justify-center rounded-full shadow-md";
  const readStyle = "bg-gray-800 text-gray-400";
  const unreadStyle = "bg-blue-500 text-white";

  switch (type.toLowerCase()) {
    case "chat":
    case "message":
      return (
        <div className={`${baseClasses} ${isRead ? readStyle : unreadStyle}`}>
          <MdChatBubble size={20} />
        </div>
      );
    case "project":
      return (
        <div className={`${baseClasses} ${isRead ? readStyle : unreadStyle}`}>
          <MdDashboard size={20} />
        </div>
      );
    case "board":
      return (
        <div className={`${baseClasses} ${isRead ? readStyle : unreadStyle}`}>
          <FcWorkflow size={20} />
        </div>
      );
    case "ama":
      return (
        <div className={`${baseClasses} ${isRead ? readStyle : unreadStyle}`}>
          <LuMessagesSquare size={20} />
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} ${isRead ? readStyle : unreadStyle}`}>
          <MdChatBubble size={20} />
        </div>
      );
  }
};

type NotificationSidebarProps = {
  notifications: Notification[];
  selectedNotification: Notification | null;
  unreadCount: number;
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onToggleMute: (id: string) => void;
};

export default function NotificationSidebar({
  notifications,
  unreadCount,
  isLoading,
  onNotificationClick,
  onMarkAllAsRead,
  onMarkAsRead,
  onToggleMute,
}: NotificationSidebarProps) {
  return (
    <div className="p-4 bg-transparent shadow overflow-y-auto min-h-screen backdrop:blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            disabled={isLoading}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <LuCheck size={16} /> Mark all as read
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
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 rounded-2xl transition-all flex items-start gap-4 shadow-sm cursor-pointer hover:bg-[#202020] ${
                !notification.isRead ? "bg-[#1f1f1f]" : "bg-[#181818]"
              }`}
              onClick={() => {
                if (!notification.isRead) onMarkAsRead(notification.id);
                onNotificationClick(notification);
              }}
            >
              <NotificationIcon
                type={notification.type}
                isRead={notification.isRead}
              />
              <div className="flex flex-col flex-1">
                <span
                  className={`text-sm text-white leading-tight ${
                    !notification.isRead ? "font-semibold" : "text-gray-300"
                  }`}
                >
                  {notification.message}
                </span>
                {notification.description && (
                  <span className="text-xs text-gray-400 line-clamp-1">
                    {notification.description}
                  </span>
                )}
                <span className="text-[11px] text-gray-500 mt-1">
                  {notification.createdAt?.toDate()
                    ? getLastSeenText(notification.createdAt)
                    : "Just now"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute(notification.id);
                }}
                className="ml-auto text-gray-400 hover:text-gray-300"
              >
                {notification.muted ? (
                  <LuBellOff size={18} />
                ) : (
                  <LuBell size={18} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
