"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Spiner from "@/components/Spiner";
import { PresenceWrapper, useChatPresence } from "@/components/useStatus";
import { addMessageNotification } from "../../activity/AddNotification";
import { getLastSeenText } from "@/components/DateFormat";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentScreen?: string | null;
  currentChatId?: string | null;
  lastSeen?: Date | null;
}

export default function ChatPage() {
  const { id: otherUserId } = useParams() as { id: string };
  const { user, name } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useChatPresence(otherUserId);
  // Generate consistent chat ID regardless of user order
  const generateChatId = useCallback((uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }, []);

  // Check participant status before sending notification
  const shouldSendNotification = useCallback(
    async (userId: string) => {
      const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
      if (!userDoc.exists()) return true;

      const userData = userDoc.data();
      return (
        !userData.isOnline ||
        userData.currentScreen !== "chatScreen" ||
        userData.currentChatId !== chatId
      );
    },
    [chatId]
  );

  // Initialize chat and set up listeners
  useEffect(() => {
    if (!user?.uid || !otherUserId) return;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError("");

        const newChatId = generateChatId(user.uid, otherUserId);
        setChatId(newChatId);

        // Fetch participant data once (no real-time listener)
        const [otherUserSnap, chatSnap] = await Promise.all([
          getDoc(doc(FIREBASE_DB, "users", otherUserId)),
          getDoc(doc(FIREBASE_DB, "chats", newChatId)),
        ]);

        if (!otherUserSnap.exists()) {
          setError("User not found");
          return;
        }

        const userData = otherUserSnap.data();
        setParticipant({
          id: otherUserId,
          name: userData.displayName || userData.name || "Unknown",
          avatar: userData.photoURL,
          isOnline: userData.isOnline || false,
          currentScreen: userData.currentScreen || null,
          currentChatId: userData.currentChatId || null,
          lastSeen: userData.lastSeen || null,
        });

        // Create chat if it doesn't exist
        if (!chatSnap.exists()) {
          await setDoc(doc(FIREBASE_DB, "chats", newChatId), {
            participants: {
              [user.uid]: true,
              [otherUserId]: true,
            },
            lastMessage: "",
            lastMessageAt: serverTimestamp(),
            lastMessageSender: "",
            createdAt: serverTimestamp(),
          });
        }

        // Set up only necessary real-time listener for messages
        const messagesRef = collection(
          FIREBASE_DB,
          "chats",
          newChatId,
          "messages"
        );
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        unsubscribeRef.current = onSnapshot(q, async (snapshot) => {
          const msgs: Message[] = [];
          const unreadBatch: Promise<void>[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            msgs.push({
              id: docSnap.id,
              senderId: data.senderId,
              content: data.content,
              timestamp: data.timestamp?.toDate() || new Date(),
              status: data.status || "sent",
            });

            if (data.senderId !== user.uid && data.status !== "read") {
              unreadBatch.push(updateDoc(docSnap.ref, { status: "read" }));
            }
          });

          setMessages(msgs);

          if (unreadBatch.length > 0) {
            await Promise.all(unreadBatch);
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg) {
              await updateDoc(doc(FIREBASE_DB, "chats", newChatId), {
                lastMessage: lastMsg.content,
                lastMessageAt: serverTimestamp(),
                lastMessageSender: lastMsg.senderId,
              });
            }
          }

          // Scroll to bottom after short delay
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        });
      } catch (err) {
        console.error("Chat initialization error:", err);
        setError("Failed to load chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      unsubscribeRef.current?.();
    };
  }, [user?.uid, otherUserId, generateChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !chatId) return;

    try {
      const chatDocRef = doc(FIREBASE_DB, "chats", chatId);
      const messagesRef = collection(chatDocRef, "messages");

      const message = {
        senderId: user.uid,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        status: "sent",
      };

      // First check if we need to send notification
      const shouldNotify = await shouldSendNotification(otherUserId);

      // Perform all Firestore operations in parallel
      await Promise.all([
        setDoc(doc(messagesRef), message),
        updateDoc(chatDocRef, {
          lastMessage: message.content,
          lastMessageAt: serverTimestamp(),
          lastMessageSender: user.uid,
        }),
        shouldNotify &&
          addMessageNotification(otherUserId, name || "Someone", user?.uid),
      ]);

      setNewMessage("");
    } catch (err) {
      console.error("Message send error:", err);
      setError("Failed to send message.");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <p>{error}</p>
        <Button onClick={() => router.push("/dashboard/more")} className="mt-4">
          Back to Chats
        </Button>
      </div>
    );
  }

  if (loading) {
    return <Spiner />;
  }

  return (
    <div className="flex flex-col h-full">
      <PresenceWrapper />
      {participant && (
        <header className="h-14 flex items-center p-4 border-b border-gray-700 sticky top-0 z-10 bg-[#1a1b1b]">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback>
              {participant.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{participant.name}</h2>
            <p className="text-xs text-gray-400">
              {participant.isOnline
                ? "Online"
                : participant.lastSeen
                ? `Last seen ${getLastSeenText(participant.lastSeen)}`
                : "Offline"}
            </p>
          </div>
        </header>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Send a message to get started</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === user?.uid}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSubmit={handleSendMessage}
      />
    </div>
  );
}

// Extracted components for better readability
const MessageBubble = ({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) => (
  <div
    className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[75%] rounded-lg p-3 ${
        isCurrentUser
          ? "bg-blue-600 rounded-br-none"
          : "bg-gray-700 rounded-bl-none"
      }`}
    >
      <p>{message.content}</p>
      <div className="flex items-center justify-end mt-1 space-x-1">
        <span className="text-xs text-gray-300">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
        {isCurrentUser && (
          <span className="text-xs">
            {message.status === "read"
              ? "✓✓"
              : message.status === "delivered"
              ? "✓"
              : ""}
          </span>
        )}
      </div>
    </div>
  </div>
);

const MessageInput = ({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form
    onSubmit={onSubmit}
    className="p-3 border-t border-gray-700 sticky bottom-0 bg-[#1a1b1b]"
  >
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Type a message..."
        className="flex-1 bg-[#252525] rounded-lg px-4 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        type="submit"
        disabled={!value.trim()}
        className="bg-blue-700 hover:bg-blue-400 text-white rounded-lg px-4 py-2"
      >
        Send
      </Button>
    </div>
  </form>
);
