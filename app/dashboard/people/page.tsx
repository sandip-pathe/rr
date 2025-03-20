"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus } from "lucide-react";
import { FIREBASE_DB } from "@/FirebaseConfig";

interface User {
  id: string;
  name: string;
  role: "mentor" | "user";
  imageUrl?: string;
  designation?: string;
  skills?: string[];
}

const PeopleCards = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(FIREBASE_DB, "users");
      const usersSnap = await getDocs(usersRef);
      const usersList: User[] = usersSnap.docs.map((doc) => ({
        ...(doc.data() as User),
        id: doc.id,
      }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  return (
    <Layout>
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => {
          return (
            <Card
              key={user.id}
              className="w-full h-auto cursor-pointer transition-transform transform hover:scale-105 border-none shadow-lg rounded-xl overflow-hidden bg-cover"
              onClick={() => router.push(`/profile/${user.id}`)}
            >
              <CardHeader className="flex flex-col items-center text-center p-5 text-white">
                <Avatar className="h-20 w-20 mb-3 border-2 border-white shadow-md">
                  {user.imageUrl ? (
                    <AvatarImage
                      src={user.imageUrl}
                      className="rounded-full overflow-auto w-20 h-20"
                    />
                  ) : (
                    <AvatarFallback className="text-xl text-white font-bold">
                      {user.name.charAt(0)}
                      {user.name.charAt(1)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-lg font-semibold">
                  {user.name}
                </CardTitle>
                <p className="text-sm">
                  {user.designation || "No designation"}
                </p>
              </CardHeader>
              <CardContent className="p-5 text-center text-white">
                <p>
                  <strong>Skills:</strong>{" "}
                  {user.skills?.join(", ") || "Not specified"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between px-5 py-4 border-t border-white/20">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-white border-white/50 hover:bg-white/20"
                  onClick={() => router.push(`/chat/${user.id}`)}
                >
                  <MessageCircle size={16} /> Chat
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-white border-white/50 hover:bg-white/20"
                >
                  <UserPlus size={16} />{" "}
                  {user.role === "mentor" ? "Connect" : "Add"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
};

export default PeopleCards;
