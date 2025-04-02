"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  serverTimestamp,
  setDoc,
  arrayUnion,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "@/app/auth/AuthContext";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { addMessageNotification } from "../../activity/AddNotification";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  readBy: string[];
}

const db = FIREBASE_DB;

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string
) => {
  // Message data with initial status (not yet delivered/seen)
  const messageData = {
    senderId,
    content,
    timestamp: serverTimestamp(),
    readBy: [senderId],
  };

  const messagesRef = collection(db, "chats", chatId, "messages");
  const docRef = await addDoc(messagesRef, messageData);

  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
  });

  return docRef.id;
};

export const updateUserStatus = async (uid: string, isOnline: boolean) => {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      isOnline,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
};

export const markMessageAsSeen = async (
  chatId: string,
  messageId: string,
  userId: string
) => {};

export const markMessageAsDelivered = async (
  chatId: string,
  messageId: string
) => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, {
    deliveredAt: serverTimestamp(),
  });
};

const ChatDetailPage = () => {
  const { chatId } = useParams() as { chatId: string };
  const { user } = useAuth();
  const currentUserId = user?.uid as string;
  const [messages, setMessages] = useState<Message[]>();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const messagesRef = collection(
      db,
      "chats",
      "qZdZWVBZ6FQMyOlK8g7i",
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);

      msgs.forEach((msg) => {
        if (
          msg.senderId !== currentUserId &&
          !msg.readBy?.includes(currentUserId!)
        ) {
          markMessageAsSeen(chatId, msg.id, currentUserId);
        }
      });
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    await sendMessage(chatId, currentUserId, newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 flex flex-row items-center p-4 bg-[#1a1b1b] sticky top-0 z-10">
        <Avatar className="h-10 w-10 m-2">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">Alice Johnson</h2>
          <p className="text-sm">Online</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex flex-col ${
              msg.senderId === currentUserId ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                msg.senderId === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.content}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {msg.timestamp?.toDate().toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="h-14 flex items-center p-4 bg-[#1a1b1b] sticky bottom-0"
      >
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border border-gray-600 bg-[#252525] rounded-l-lg p-2 text-white focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatDetailPage;
