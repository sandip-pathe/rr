"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MdAdd, MdCall, MdChat, MdSend, MdVideoCall } from "react-icons/md";
import MessageBubble from "@/components/BubbleMessage";
import MessageInput from "@/components/MessageInput";
import { BsThreeDotsVertical } from "react-icons/bs";

export interface Message {
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
    <div className="flex flex-col h-full border-none bg-white/5 backdrop-blur-md">
      <PresenceWrapper />
      {participant && (
        <header className="h-16 px-5 py-3 flex items-center sticky top-0 z-10 bg-[#0d1117]/90">
          <div className="relative mr-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-500">
                {participant.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {participant.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0d1117]"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-200">
              {participant.name}
            </h2>
            <p className="text-xs text-gray-500">
              {participant.isOnline
                ? "Online now"
                : participant.lastSeen
                ? `Last seen ${getLastSeenText(participant.lastSeen)}`
                : "Offline"}
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <MdCall
              className="text-gray-400 hover:text-gray-300 cursor-pointer"
              size={24}
              onClick={() => alert("Call feature coming soon!")}
            />
            <MdVideoCall
              className="text-gray-400 hover:text-gray-300 cursor-pointer"
              size={24}
              onClick={() => alert("Video call feature coming soon!")}
            />
            <BsThreeDotsVertical
              className="text-gray-400 hover:text-gray-300 cursor-pointer"
              size={24}
              onClick={() => alert("More options coming soon!")}
            />
          </div>
        </header>
      )}

      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-[#121820] to-[#353738] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 max-w-md text-center">
              <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <MdChat className="text-3xl text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 mb-4">
                Send your first message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isCurrentUser={msg.senderId === user?.uid}
              />
            ))}
          </div>
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
