import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { NotificationType } from "@/types/Notification";

export const addNotification = async (
  userId: string,
  message: string,
  referenceId: string,
  type: NotificationType
): Promise<void> => {
  if (!userId || !message || !referenceId || !type) {
    throw new Error("Missing required parameters for notification");
  }

  let link = "/";

  switch (type) {
    case "message":
      link = `/dashboard/more/${referenceId}`;
      break;
    case "project":
      link = `/dashboard/projects/${referenceId}`;
      break;
    case "task":
      link = `/dashboard/projects/${referenceId}`;
      break;
    case "community":
      link = `/dashboard/community/${referenceId}`;
      break;
    default:
      link = "/";
  }

  try {
    await addDoc(collection(FIREBASE_DB, "notifications"), {
      userId,
      message,
      referenceId,
      type,
      link,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

// Utility function to add message notifications
export const addMessageNotification = async (
  userId: string,
  senderName: string,
  conversationId: string
): Promise<void> => {
  await addNotification(
    userId,
    `You have a new message from ${senderName}`,
    conversationId,
    "message"
  );
};

// Utility function to add project notifications
export const addProjectNotification = async (
  userId: string,
  projectName: string,
  projectId: string,
  action: string
): Promise<void> => {
  await addNotification(
    userId,
    `${action} in project "${projectName}"`,
    projectId,
    "project"
  );
};
