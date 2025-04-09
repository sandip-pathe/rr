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
  onSnapshot,
  Unsubscribe,
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
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Generate consistent chat ID regardless of user order
  const generateChatId = (uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  useEffect(() => {
    if (!user?.uid || !otherUserId) return;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError("");

        const newChatId = generateChatId(user.uid, otherUserId);
        setChatId(newChatId);

        // Fetch other user details
        const otherUserSnap = await getDoc(
          doc(FIREBASE_DB, "users", otherUserId)
        );
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
        });

        // Create chat doc if it doesn't exist
        const chatDocRef = doc(FIREBASE_DB, "chats", newChatId);
        const chatSnap = await getDoc(chatDocRef);

        if (!chatSnap.exists()) {
          await setDoc(chatDocRef, {
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

        // Set up real-time listener for messages
        const messagesRef = collection(
          FIREBASE_DB,
          "chats",
          newChatId,
          "messages"
        );
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        unsubscribeRef.current?.(); // Cleanup previous listener

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

            // Mark messages as read
            if (data.senderId !== user.uid && data.status !== "read") {
              unreadBatch.push(
                updateDoc(
                  doc(FIREBASE_DB, "chats", newChatId, "messages", docSnap.id),
                  {
                    status: "read",
                  }
                )
              );
            }
          });

          setMessages(msgs);

          if (unreadBatch.length > 0) {
            await Promise.all(unreadBatch);
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg) {
              await updateDoc(chatDocRef, {
                lastMessage: lastMsg.content,
                lastMessageAt: serverTimestamp(),
                lastMessageSender: lastMsg.senderId,
              });
            }
          }

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        });
      } catch (err) {
        console.error("initializeChat error:", err);
        setError("Failed to load chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      unsubscribeRef.current?.();
    };
  }, [user?.uid, otherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !chatId) return;

    const chatDocRef = doc(FIREBASE_DB, "chats", chatId);
    const messagesRef = collection(chatDocRef, "messages");

    const message = {
      senderId: user.uid,
      content: newMessage.trim(),
      timestamp: serverTimestamp(),
      status: "sent",
    };

    try {
      const newMsgRef = doc(messagesRef);
      await setDoc(newMsgRef, message);

      await updateDoc(chatDocRef, {
        lastMessage: message.content,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: user.uid,
      });

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
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
