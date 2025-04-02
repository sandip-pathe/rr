"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Notification } from "@/types/Notification";

export const useNotifications = (userId: string): Notification[] => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(FIREBASE_DB, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Notification)
      );
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [userId]);

  return notifications;
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    await updateDoc(doc(FIREBASE_DB, "notifications", notificationId), {
      isRead: true,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  if (!userId) return;

  try {
    const q = query(
      collection(FIREBASE_DB, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(FIREBASE_DB);

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};
