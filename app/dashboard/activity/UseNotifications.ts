"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Notification } from "@/types/Notification";

// ✅ Return both notifications and loading state
export const useNotifications = (
  userId: string
): {
  notifications: Notification[];
  loading: boolean;
} => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(FIREBASE_DB, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // ✅ Set loading to true before subscribing
    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newNotifications = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Notification)
        );
        setNotifications(newNotifications);
        setLoading(false); // ✅ Done loading once we receive data
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false); // ✅ Fail-safe to stop loading if there's an error
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
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
