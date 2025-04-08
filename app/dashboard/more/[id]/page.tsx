"use client";

import React, { useState, useEffect, useRef } from "react";
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
  getDocs,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Spiner from "@/components/Spiner";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

export default function ChatPage() {
  const { id: otherUserId } = useParams() as { id: string };
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
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  useEffect(() => {
    if (!user?.uid || !otherUserId) return;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError("");

        const newChatId = generateChatId(user.uid, otherUserId);
        setChatId(newChatId);

        // Check if other user exists
        const otherUserDoc = await getDoc(
          doc(FIREBASE_DB, "users", otherUserId)
        );
        if (!otherUserDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setParticipant({
          id: otherUserId,
          name:
            otherUserDoc.data().displayName ||
            otherUserDoc.data().name ||
            "Unknown",
          avatar: otherUserDoc.data().photoURL,
          isOnline: otherUserDoc.data().isOnline || false,
        });

        // Check/create chat document
        const chatDocRef = doc(FIREBASE_DB, "chats", newChatId);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            participants: [user.uid, otherUserId],
            lastMessage: "",
            lastMessageAt: serverTimestamp(),
            lastMessageSender: "",
            createdAt: serverTimestamp(),
          });
        }

        // Load initial messages (without real-time listener)
        const messagesRef = collection(
          FIREBASE_DB,
          "chats",
          newChatId,
          "messages"
        );
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
        const messagesSnapshot = await getDocs(messagesQuery);

        const msgs = messagesSnapshot.docs.map((doc) => ({
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
          const updatePromises = unreadMessages.map((msg) =>
            updateDoc(
              doc(FIREBASE_DB, "chats", newChatId, "messages", msg.id),
              {
                status: "read",
              }
            )
          );

          await Promise.all(updatePromises);
          await updateDoc(chatDocRef, {
            lastMessage: msgs[msgs.length - 1]?.content || "",
            lastMessageAt: serverTimestamp(),
            lastMessageSender: msgs[msgs.length - 1]?.senderId || "",
          });
        }

        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Failed to load chat. Please try again.");
        setLoading(false);
      }
    };

    initializeChat();
  }, [otherUserId, user?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !chatId) return;

    try {
      const messagesRef = collection(FIREBASE_DB, "chats", chatId, "messages");
      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        senderId: user.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
        status: "sent",
      });

      const chatDocRef = doc(FIREBASE_DB, "chats", chatId);
      await updateDoc(chatDocRef, {
        lastMessage: newMessage,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: user.uid,
      });

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
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
            className="flex-1 bg-[#252525] rounded-lg px-4 py-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-700 hover:bg-blue-400 text-white rounded-lg px-4 py-2"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
