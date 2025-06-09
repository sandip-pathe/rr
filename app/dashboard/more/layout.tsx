"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdAddComment, MdSearch } from "react-icons/md";
import { useAuth } from "@/app/auth/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Link from "next/link";
import { getLastSeenText } from "@/components/DateFormat";

interface ChatListItem {
  id: string;
  participants: Record<string, boolean>;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSender?: string;
  otherParticipant?: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
}

const MessagesLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const db = FIREBASE_DB;
  const chatsUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchChats = async () => {
      try {
        // Simple query - just get chats where user is participant
        const chatsQuery = query(
          collection(db, "chats"),
          where(`participants.${user.uid}`, "==", true)
        );

        // Unsubscribe from previous listener if exists
        if (chatsUnsubscribeRef.current) {
          chatsUnsubscribeRef.current();
        }

        chatsUnsubscribeRef.current = onSnapshot(
          chatsQuery,
          async (snapshot) => {
            const chatsData = await Promise.all(
              snapshot.docs.map(async (chatDoc) => {
                const data = chatDoc.data();
                const participantIds = Object.keys(data.participants);
                const otherParticipantId = participantIds.find(
                  (id) => id !== user.uid
                );

                if (!otherParticipantId) {
                  return null;
                }

                const userDoc = await getDoc(
                  doc(db, "users", otherParticipantId)
                );
                const participantData = userDoc.data();

                return {
                  id: chatDoc.id,
                  participants: data.participants,
                  lastMessage: data.lastMessage,
                  lastMessageAt: data.lastMessageAt?.toDate(),
                  lastMessageSender: data.lastMessageSender,
                  otherParticipant: {
                    id: otherParticipantId,
                    name:
                      participantData?.displayName ||
                      participantData?.name ||
                      "Unknown",
                    avatar: participantData?.photoURL,
                    isOnline: participantData?.isOnline || false,
                  },
                };
              })
            );

            // Filter out null values and sort locally by lastMessageAt
            const validChats = chatsData.filter(Boolean) as ChatListItem[];
            validChats.sort((a, b) => {
              const aTime = a.lastMessageAt?.getTime() || 0;
              const bTime = b.lastMessageAt?.getTime() || 0;
              return bTime - aTime; // Descending order
            });

            setChats(validChats);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    fetchChats();

    return () => {
      if (chatsUnsubscribeRef.current) {
        chatsUnsubscribeRef.current();
      }
    };
  }, [user?.uid, db]);

  const filteredChats = chats.filter((chat) =>
    chat.otherParticipant?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-48px)] bg-[#0d1117]">
        {/* Left sidebar - Teams & People */}
        <div className="hidden md:block md:w-1/3 border-none flex-col overflow-hidden p-4">
          {/* Top search bar */}
          <div className="relative mb-3 flex items-center bg-[#161b22] rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search Chats..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <button className="p-1.5 rounded-full hover:bg-gray-700 transition">
              <MdAddComment className="text-xl text-gray-300" />
            </button>
          </div>
          {/* Teams Section (Top 2/5) */}
          <div className="h-2/5 flex flex-col overflow-hidden">
            <div className="p-4">
              <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {/* Team List */}
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center p-3 rounded-lg bg-[#161b22] hover:bg-[#1f2937] transition cursor-pointer"
                    >
                      <div className="relative mr-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                          <span className="font-bold text-white">T{i + 1}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0d1117]"></div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-200">
                          Design Team {i + 1}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          You: Let's finalize the mockups...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* People Section (Bottom 3/5) */}
          <div className="h-3/5 flex flex-col">
            <div className="overflow-y-auto flex-1 px-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-300">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="pb-4">
                  {filteredChats.length > 0 ? (
                    <ul className="space-y-1.5">
                      {filteredChats.map((chat) => (
                        <li key={chat.id}>
                          <Link
                            href={`/dashboard/more/${chat.otherParticipant?.id}`}
                          >
                            <div
                              className={`p-3 rounded-xl flex items-center transition-all ${
                                pathname.includes(
                                  chat.otherParticipant?.id || ""
                                )
                                  ? "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/50"
                                  : "bg-[#161b22] hover:bg-[#1f2937]"
                              }`}
                            >
                              <div className="relative mr-3">
                                <Avatar className="h-10 w-10 rounded-lg">
                                  <AvatarImage
                                    src={chat.otherParticipant?.avatar}
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-500">
                                    {chat.otherParticipant?.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {chat.otherParticipant?.isOnline && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#161b22]"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium text-gray-200 truncate">
                                    {chat.otherParticipant?.name}
                                  </h3>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {chat.lastMessageAt
                                      ? getLastSeenText(chat.lastMessageAt)
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-gray-500 truncate max-w-[70%]">
                                    {chat.lastMessage}
                                  </p>
                                  {chat.lastMessageSender === user?.uid && (
                                    <span className="text-xs text-blue-500">
                                      ✓✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex justify-center items-center h-64 text-gray-500">
                      No chats found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Chat UI */}
        <div className="w-full md:w-2/3 flex flex-col h-full">{children}</div>
      </div>
    </Layout>
  );
};

export default MessagesLayout;
