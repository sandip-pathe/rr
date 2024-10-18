"use client";

import React from "react";
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

interface User {
  id: string;
  name: string;
  role: "mentor" | "user";
  imageUrl?: string; // Optional image URL
  designation?: string;
}

const users: User[] = [
  {
    id: "1",
    name: "Manoj Suryawanshi",
    designation: "Assistant Professor",
    role: "mentor",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    name: "Sagar Shinde",
    designation: "BE Student",
    role: "user",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    name: "Dr. Nayana Mahajan",
    designation: "Associate Professor",
    role: "mentor",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: "4",
    name: "Soham Karulkar",
    role: "user",
    designation: "SE Student",
    imageUrl: "https://via.placeholder.com/150",
  },
  // Add more users as needed
];

const PeopleCards = () => {
  const router = useRouter();

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/people/${id}`);
  };

  return (
    <Layout>
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {users.map((user, index) => (
          <Card
            onClick={() => handleCardClick(user.id)}
            key={index}
            className={` w-70 h-auto transition-transform transform hover:scale-105 ${
              user.role === "mentor" ? "border-2 border-cyan-400" : ""
            }`}
          >
            <CardHeader className="items-center">
              <Avatar className="h-16 w-16">
                {user.imageUrl ? (
                  <AvatarImage src={user.imageUrl} />
                ) : (
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <p className="text-sm ">{user.designation}</p>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Skills: </strong>Java, React, Python
              </p>
            </CardContent>
            <CardFooter>
              {user.role === "mentor" ? (
                <a className="text-green-500 z-10">Connect +</a>
              ) : (
                <a className="text-green-500 z-10">Add +</a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default PeopleCards;
