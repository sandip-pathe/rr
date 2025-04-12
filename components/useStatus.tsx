"use client";

import { useEffect, useRef } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";

// Track online/offline status only
const useOnlineStatusTracker = () => {
  const { user } = useAuth();
  const wasOnlineRef = useRef(false);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(FIREBASE_DB, "users", user.uid);

    const handleConnectionChange = async () => {
      const isOnline = navigator.onLine;
      if (wasOnlineRef.current !== isOnline) {
        wasOnlineRef.current = isOnline;
        await updateDoc(userRef, {
          isOnline,
          lastSeen: serverTimestamp(),
        });
      }
    };

    // Initial check
    handleConnectionChange();

    // Event listeners
    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);

      // Mark offline on unmount
      updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    };
  }, [user?.uid]);
};

// Track screen navigation (including chat screens)
const useScreenPresenceTracker = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const prevScreenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(FIREBASE_DB, "users", user.uid);
    const screen = pathname.includes("/chat/") ? "chatScreen" : null;
    const prevScreen = prevScreenRef.current;

    if (screen !== prevScreen) {
      prevScreenRef.current = screen;
      updateDoc(userRef, {
        currentScreen: screen,
        lastSeen: serverTimestamp(),
      });
    }
  }, [user?.uid, pathname]);
};

// Combined tracker (if needed)
const usePresenceTracker = () => {
  useOnlineStatusTracker();
  useScreenPresenceTracker();
};

// Specialized chat presence tracker
const useChatPresence = (chatId: string) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid || !chatId) return;

    const userRef = doc(FIREBASE_DB, "users", user.uid);

    // Mark user as viewing this chat
    updateDoc(userRef, {
      currentScreen: "chatScreen",
      currentChatId: chatId,
      lastSeen: serverTimestamp(),
    });

    return () => {
      updateDoc(userRef, {
        currentScreen: null,
        currentChatId: null,
        lastSeen: serverTimestamp(),
      });
    };
  }, [user?.uid, chatId]);
};

// Global wrapper that only handles online status
const PresenceWrapper = () => {
  useOnlineStatusTracker();
  return null;
};

export {
  useOnlineStatusTracker,
  useScreenPresenceTracker,
  usePresenceTracker,
  useChatPresence,
  PresenceWrapper,
};
