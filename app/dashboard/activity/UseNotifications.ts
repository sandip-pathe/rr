"use client";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<{ id: string; [key: string]: any }[]>([]);

  useEffect(() => {
    console.log("Fetching notifications for user:", userId);
    if (!userId) return;

    const q = query(
      collection(FIREBASE_DB, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [userId]);

  return notifications;
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(FIREBASE_DB, "notifications", notificationId), {
      isRead: true,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
  }
};