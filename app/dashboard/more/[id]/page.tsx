"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  sendMessage,
  markMessagesAsRead,
  getOrCreateChat,
} from "../ChatServices";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

export default function ChatPage() {
  const { id: chatId } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<{
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chat exists or needs to be created
  useEffect(() => {
    if (!user?.uid || !chatId) return;

    const initializeChat = async () => {
      try {
        if (chatId !== user.uid && !chatId.includes("_")) {
          const existingChatId = await getOrCreateChat(user.uid, chatId);
          if (existingChatId !== chatId) {
            router.replace(`/dashboard/more/${existingChatId}`);
            return;
          }
        }

        const messagesRef = collection(
          FIREBASE_DB,
          "chats",
          chatId,
          "messages"
        );
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            senderId: doc.data().senderId,
            content: doc.data().content,
            timestamp: doc.data().timestamp?.toDate(),
            status: doc.data().status || "sent",
          })) as Message[];

          setMessages(msgs);
          setLoading(false);

          // Mark messages as read
          const unreadMessages = msgs.filter(
            (msg) => msg.senderId !== user.uid && msg.status !== "read"
          );
          if (unreadMessages.length > 0) {
            markMessagesAsRead(
              chatId,
              user.uid,
              unreadMessages.map((msg) => msg.id)
            );
          }

          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatId, user?.uid]);

  // Fetch participant info
  useEffect(() => {
    if (!chatId || !user?.uid) return;

    const fetchParticipant = async () => {
      try {
        const chatDoc = await getDoc(doc(FIREBASE_DB, "chats", chatId));
        if (chatDoc.exists()) {
          const participants = chatDoc.data().participants;
          const otherParticipantId = participants.find(
            (id: string) => id !== user.uid
          );

          if (otherParticipantId) {
            const userDoc = await getDoc(
              doc(FIREBASE_DB, "users", otherParticipantId)
            );
            if (userDoc.exists()) {
              setParticipant({
                id: otherParticipantId,
                name: userDoc.data().displayName,
                avatar: userDoc.data().photoURL,
                isOnline: userDoc.data().isOnline || false,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching participant:", error);
      }
    };

    fetchParticipant();
  }, [chatId, user?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !chatId) return;

    try {
      await sendMessage(chatId, user.uid, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1b1b] text-white">
      {participant && (
        <header className="h-16 flex items-center p-4 border-b border-gray-700 sticky top-0 z-10 bg-[#1a1b1b]">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback>
              {participant.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{participant.name}</h2>
            <p className="text-xs text-gray-400">
              {participant.isOnline ? "Online" : "Offline"}
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
            <div
              key={msg.id}
              className={`mb-4 flex ${
                msg.senderId === user?.uid ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.senderId === user?.uid
                    ? "bg-blue-600 rounded-br-none"
                    : "bg-gray-700 rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className="text-xs text-gray-300">
                    {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                  </span>
                  {msg.senderId === user?.uid && (
                    <span className="text-xs">
                      {msg.status === "read"
                        ? "✓✓"
                        : msg.status === "delivered"
                        ? "✓"
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-700 sticky bottom-0 bg-[#1a1b1b]"
      >
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-[#252525] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
