"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { usePageHeading } from "@/app/auth/PageHeadingContext";
import { MdAddComment, MdSearch } from "react-icons/md";
import { useAuth } from "@/app/auth/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Link from "next/link";

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

interface User {
  id: string;
  name: string;
  photoURL?: string;
  email: string;
  isOnline?: boolean;
}

const MessagesLayout = ({ children }: { children: React.ReactNode }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { setHeading, setIsVisible } = usePageHeading();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const db = FIREBASE_DB;
  const chatsUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchInitialData = async () => {
      try {
        // Fetch all users (excluding current user)
        const usersQuery = query(
          collection(db, "users"),
          where("uid", "!=", user.uid)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setAllUsers(usersData);

        // Set up real-time listener for chats
        const chatsQuery = query(
          collection(db, "chats"),
          where(`participants.${user.uid}`, "==", true),
          orderBy("lastMessageAt", "desc")
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

            setChats(chatsData.filter(Boolean) as ChatListItem[]);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      if (chatsUnsubscribeRef.current) {
        chatsUnsubscribeRef.current();
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!headingRef.current) return;
    setHeading(headingRef.current.innerText);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(headingRef.current);
    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, [setHeading, setIsVisible]);

  const filteredChats = chats.filter((chat) =>
    chat.otherParticipant?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(
    (userItem) =>
      !chats.some((chat) => chat.otherParticipant?.id === userItem.id) &&
      (userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()))
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
      <div className="flex h-[calc(100vh-48px)]">
        <div className="hidden md:block md:w-1/3 bg-[#1a1b1b] border-x border-gray-500 flex-col">
          <div className="p-4 border-b border-gray-700 sticky top-0 z-10 bg-[#1a1b1b]">
            <div className="flex flex-row items-center justify-between">
              <h1 ref={headingRef} className="text-2xl font-bold text-gray-300">
                Chats
              </h1>
              <MdAddComment className="text-3xl text-gray-300 cursor-pointer" />
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search chats or users..."
                className="w-full pl-10 pr-4 py-2 bg-[#252525] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {filteredChats.length > 0 && (
                  <div className="mb-6 pt-2">
                    <h2 className="text-lg font-semibold text-gray-300 mb-2 px-4">
                      Your Chats
                    </h2>
                    <ul>
                      {filteredChats.map((chat) => (
                        <li key={chat.id} className="px-4">
                          <Link
                            href={`/dashboard/more/${chat.otherParticipant?.id}`}
                          >
                            <div
                              className={`p-2 mb-2 flex flex-row items-center cursor-pointer rounded-sm shadow-sm ${
                                pathname.includes(
                                  chat.otherParticipant?.id || ""
                                )
                                  ? "bg-[#303030]"
                                  : "bg-[#252525]"
                              } hover:bg-[#303030] transition`}
                            >
                              <Avatar className="h-10 w-10 m-2">
                                <AvatarImage
                                  src={chat.otherParticipant?.avatar}
                                />
                                <AvatarFallback>
                                  {chat.otherParticipant?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col w-full">
                                <div className="flex flex-row items-center justify-between">
                                  <h2 className="text-base font-bold max-w-[70%] line-clamp-1">
                                    {chat.otherParticipant?.name}
                                  </h2>
                                  <span className="text-xs text-blue-400 line-clamp-1">
                                    {chat.lastMessageAt
                                      ? formatDistanceToNow(
                                          chat.lastMessageAt,
                                          {
                                            addSuffix: true,
                                          }
                                        )
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-gray-400 line-clamp-1 max-w-[80%]">
                                    {chat.lastMessage}
                                  </p>
                                  {chat.lastMessageSender === user?.uid && (
                                    <span className="text-xs text-gray-500">
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
                  </div>
                )}

                {(searchTerm || filteredUsers.length > 0) && (
                  <div className="pt-2">
                    <h2 className="text-lg font-semibold text-gray-300 mb-2 px-4">
                      {searchTerm ? "Search Results" : "All Users"}
                    </h2>
                    <ul>
                      {filteredUsers.map((userItem) => (
                        <li key={userItem.id} className="px-4">
                          <Link href={`/dashboard/more/${userItem.id}`}>
                            <div className="p-2 mb-2 flex flex-row items-center cursor-pointer rounded-sm shadow-sm bg-[#252525] hover:bg-[#303030] transition">
                              <Avatar className="h-10 w-10 m-2">
                                <AvatarImage src={userItem.photoURL} />
                                <AvatarFallback>
                                  {userItem.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col w-full">
                                <div className="flex flex-row items-center justify-between">
                                  <h2 className="text-base font-bold max-w-[70%] line-clamp-1">
                                    {userItem.name}
                                  </h2>
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      userItem.isOnline
                                        ? "bg-green-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-1">
                                  {userItem.email}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="w-full md:w-2/3 flex flex-col h-full">{children}</div>
      </div>
    </Layout>
  );
};

export default MessagesLayout;
