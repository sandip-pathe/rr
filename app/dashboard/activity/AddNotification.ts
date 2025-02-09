import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";

export const addNotification = async (
  userId: string,
  message: string,
  referenceId: string,
  type: "message" | "project" | "task" | "community"
) => {
  let link = "/"; 

  if (type === "message") link = `/messages/${referenceId}`;
  else if (type === "project") link = `/projects/${referenceId}`;
  else if (type === "task") link = `/projects/${referenceId}/kanban`;
  else if (type === "community") link = `/community/${referenceId}`;

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
  }
};
