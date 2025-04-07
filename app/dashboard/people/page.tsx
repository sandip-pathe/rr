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
import {
  MessageCircle,
  UserPlus,
  Rocket,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Spiner from "@/components/Spiner";

interface User {
  id: string;
  name: string;
  role: "mentor" | "user" | "founder";
  imageUrl?: string;
  designation?: string;
  skills?: string[];
  company?: string;
}

const PeopleCards = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [founders, setFounders] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter((user) => {
        return (
          user.name.toLowerCase().includes(lowercasedQuery) ||
          (user.designation &&
            user.designation.toLowerCase().includes(lowercasedQuery)) ||
          (user.skills &&
            user.skills.some((skill) =>
              skill.toLowerCase().includes(lowercasedQuery)
            )) ||
          (user.role && user.role.toLowerCase().includes(lowercasedQuery)) ||
          (user.company && user.company.toLowerCase().includes(lowercasedQuery))
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(FIREBASE_DB, "users");
        const usersSnap = await getDocs(usersRef);
        const usersList: User[] = usersSnap.docs.map((doc) => ({
          ...(doc.data() as User),
          id: doc.id,
        }));
        setUsers(usersList);
        setFilteredUsers(usersList);
        setFounders(usersList.filter((user) => user.role === "founder"));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = users.filter((user) => {
      return (
        user.name.toLowerCase().includes(lowercasedQuery) ||
        (user.designation &&
          user.designation.toLowerCase().includes(lowercasedQuery)) ||
        (user.skills &&
          user.skills.some((skill) =>
            skill.toLowerCase().includes(lowercasedQuery)
          )) ||
        (user.role && user.role.toLowerCase().includes(lowercasedQuery)) ||
        (user.company && user.company.toLowerCase().includes(lowercasedQuery))
      );
    });
    setFilteredUsers(filtered);
  };

  const handleKeyStroke = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Trigger search on Enter key
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter((user) => {
        return (
          user.name.toLowerCase().includes(lowercasedQuery) ||
          (user.designation &&
            user.designation.toLowerCase().includes(lowercasedQuery)) ||
          (user.skills &&
            user.skills.some((skill) =>
              skill.toLowerCase().includes(lowercasedQuery)
            )) ||
          (user.role && user.role.toLowerCase().includes(lowercasedQuery)) ||
          (user.company && user.company.toLowerCase().includes(lowercasedQuery))
        );
      });
      setFilteredUsers(filtered);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-900 min-h-screen p-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Networking Features */}
          <div className="lg:col-span-1 space-y-6">
            {/* Suggested Connections */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="text-blue-400" size={20} />
                  <CardTitle className="text-white text-lg">
                    Suggested Connections
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {user.imageUrl ? (
                        <AvatarImage src={user.imageUrl} />
                      ) : (
                        <AvatarFallback className="bg-gray-600 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">
                        {user.designation}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="ml-auto bg-inherit hover:bg-gray-700 border border-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Connect logic here
                      }}
                    >
                      <UserPlus size={16} color="white" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Project Matchmaking */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-purple-400" size={20} />
                  <CardTitle className="text-white text-lg">
                    Project Matchmaking
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Find people with complementary skills for your next project
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-blue-600 hover:bg-blue-700 border-none text-white"
                  onClick={() => router.push("/projects")}
                >
                  Browse Projects
                </Button>
              </CardContent>
            </Card>

            {/* YC Founder Matching */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="text-yellow-400" size={20} />
                  <CardTitle className="text-white text-lg">
                    Founder Matching
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Connect with potential co-founders and early team members
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 border-none text-white"
                  onClick={() => router.push("/founder-matching")}
                >
                  <Sparkles size={16} className="mr-2" />
                  Find Co-founders
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed - People Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search/Filter Bar */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search people by name, skills, or role..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    handleKeyStroke(e);
                  }}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    handleSearch;
                  }}
                >
                  Search
                </Button>
              </div>
            </Card>

            {/* People Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <Card
                  onClick={() => router.push(`/dashboard/people/${user.id}`)}
                  key={user.id}
                  className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar
                        className="h-12 w-12 cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/people/${user.id}`)
                        }
                      >
                        {user.imageUrl ? (
                          <AvatarImage src={user.imageUrl} />
                        ) : (
                          <AvatarFallback className="bg-gray-600 text-white">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle
                          className="text-white text-base cursor-pointer hover:underline"
                          onClick={() =>
                            router.push(`/dashboard/people/${user.id}`)
                          }
                        >
                          {user.name}
                        </CardTitle>
                        <p className="text-gray-400 text-sm">
                          {user.designation}
                        </p>
                        {user.company && (
                          <p className="text-gray-400 text-sm">
                            {user.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {user.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/chat/${user.id}`);
                      }}
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-600 border-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Connect logic here
                      }}
                    >
                      <UserPlus size={16} className="mr-2" />
                      Connect
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Founder Matching */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Founders */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="text-yellow-400" size={20} />
                  <CardTitle className="text-white text-lg">
                    Featured Founders
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {founders.slice(0, 4).map((founder) => (
                  <div
                    key={founder.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-700 p-2 rounded"
                    onClick={() => router.push(`/profile/${founder.id}`)}
                  >
                    <Avatar className="h-10 w-10">
                      {founder.imageUrl ? (
                        <AvatarImage src={founder.imageUrl} />
                      ) : (
                        <AvatarFallback className="bg-gray-600 text-white">
                          {founder.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{founder.name}</p>
                      <p className="text-gray-400 text-sm">
                        {founder.company || "Startup Founder"}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="text-blue-400 w-full hover:bg-gray-700"
                  onClick={() => router.push("/founders")}
                >
                  View All Founders
                </Button>
              </CardFooter>
            </Card>

            {/* Skills in Demand */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-green-400" size={20} />
                  <CardTitle className="text-white text-lg">
                    Skills in Demand
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "Next.js",
                    "AI/ML",
                    "Blockchain",
                    "Product Design",
                    "Growth Hacking",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PeopleCards;
