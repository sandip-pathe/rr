"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/auth/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { getOrCreateChat } from "./ChatServices";

interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
  isOnline: boolean;
}

const NewChatPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const db = FIREBASE_DB;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "!=", user?.uid));
        const querySnapshot = await getDocs(q);

        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  const handleStartChat = async (userId: string) => {
    if (!user?.uid) return;

    try {
      const chatId = await getOrCreateChat(user.uid, userId);
      router.push(`/dashboard/messages/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">New Chat</h1>
      <Input
        type="text"
        placeholder="Search users..."
        className="mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition"
              onClick={() => handleStartChat(user.id)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>
                  {user.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user.displayName}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="ml-auto">
                <span
                  className={`h-2 w-2 rounded-full ${
                    user.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewChatPage;
