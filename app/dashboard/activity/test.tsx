"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { addNotification } from "./AddNotification";

const NotificationTester = () => {
  const { user } = useAuth();

  const sendTestNotification = async () => {
    if (!user?.uid) return;

    await addNotification(
      user.uid,
      "This is a test notification",
      "test-id",
      "message"
    );
  };

  return (
    <div className="fixed bottom-4 left-24 z-50">
      <button
        onClick={sendTestNotification}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Send Test Notification
      </button>
    </div>
  );
};

export default NotificationTester;
