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
  action: "created" | "updated" | "added" | "invited" | string
): Promise<void> => {
  let message = "";

  switch (action.toLowerCase()) {
    case "created":
      message = `New project "${projectName}" has been created`;
      break;
    case "updated":
      message = `Project "${projectName}" has been updated`;
      break;
    case "added":
    case "invited":
      message = `You've been added to project "${projectName}"`;
      break;
    default:
      message = `${action} in project "${projectName}"`;
  }

  await addNotification(userId, message, projectId, "project");
};

export const addTaskNotification = async (
  userId: string,
  taskTitle: string,
  taskId: string,
  action: "created" | "updated" | "assigned" | "completed" | string
): Promise<void> => {
  let message = "";

  switch (action.toLowerCase()) {
    case "created":
      message = `New task "${taskTitle}" has been created`;
      break;
    case "updated":
      message = `Task "${taskTitle}" has been updated`;
      break;
    case "assigned":
      message = `You've been assigned to task "${taskTitle}"`;
      break;
    case "completed":
      message = `Task "${taskTitle}" has been completed`;
      break;
    default:
      message = `${action} for task "${taskTitle}"`;
  }

  await addNotification(userId, message, taskId, "task");
};
