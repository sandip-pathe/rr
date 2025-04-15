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
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  UserPlus,
  Rocket,
  Users,
  Briefcase,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Spiner from "@/components/Spiner";
import { useAuth } from "@/app/auth/AuthContext";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  role: "mentor" | "user" | "founder";
  imageUrl?: string;
  designation?: string;
  skills?: string[];
  company?: string;
  introduction?: string;
}

const PeopleCards = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [founders, setFounders] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [bookmarkedUsers, setBookmarkedUsers] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "saved">("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserBookmarks = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
        const saved = userDoc.data()?.savedUsers || [];
        setBookmarkedUsers(saved);
      } catch (error) {
        console.error("Failed to fetch bookmarks", error);
      }
    };

    fetchUserBookmarks();
  }, [user?.uid]);

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
        setIsLoading(true);
        const usersRef = collection(FIREBASE_DB, "users");
        const usersSnap = await getDocs(usersRef);
        const usersList: User[] = usersSnap.docs
          .map((doc) => ({
            ...(doc.data() as User),
            id: doc.id,
          }))
          // Filter out the current user
          .filter((u) => u.id !== user?.uid);

        setUsers(usersList);
        setFilteredUsers(usersList);
        setFounders(usersList.filter((user) => user.role === "founder"));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.uid) {
      fetchUsers();
    }
  }, [user?.uid]);

  const toggleBookmark = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) {
      toast.error("Please login to save users");
      return;
    }

    try {
      const userRef = doc(FIREBASE_DB, "users", user.uid);

      if (bookmarkedUsers.includes(userId)) {
        await updateDoc(userRef, {
          savedUsers: arrayRemove(userId),
        });
        setBookmarkedUsers((prev) => prev.filter((id) => id !== userId));
        toast.success("Removed from saved users");
      } else {
        await updateDoc(userRef, {
          savedUsers: arrayUnion(userId),
        });
        setBookmarkedUsers((prev) => [...prev, userId]);
        toast.success("Added to saved users");
      }
    } catch (error) {
      toast.error("Failed to update saved users");
      console.error("Error toggling bookmark:", error);
    }
  };

  const displayedUsers =
    activeFilter === "saved"
      ? filteredUsers.filter((user) => bookmarkedUsers.includes(user.id))
      : filteredUsers;

  return (
    <Layout>
      <div className="bg-gray-900 min-h-screen p-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Networking Features */}
          <div className="lg:col-span-1 space-y-6">
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
                  onClick={() => router.push("/dashboard/repo/open")}
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
                />
                <div className="flex gap-2">
                  <Button
                    variant={activeFilter === "all" ? "default" : "outline"}
                    onClick={() => setActiveFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={activeFilter === "saved" ? "default" : "outline"}
                    onClick={() => setActiveFilter("saved")}
                    className="flex items-center gap-2"
                  >
                    <Bookmark size={16} />
                    Saved
                  </Button>
                </div>
              </div>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spiner />
              </div>
            ) : displayedUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedUsers.map((user) => (
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
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
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
                            <button
                              onClick={(e) => toggleBookmark(user.id, e)}
                              className="text-gray-400 hover:text-yellow-400"
                            >
                              <Bookmark
                                size={18}
                                fill={
                                  bookmarkedUsers.includes(user.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </div>
                          {user.introduction && (
                            <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                              {user.introduction}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {user.skills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{user.skills.length - 4}
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
                          router.push(`/dashboard/more/${user.id}`);
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
                          router.push(`/dashboard/people/${user.id}`);
                        }}
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <p className="text-gray-400">
                  {activeFilter === "saved"
                    ? "You haven't saved any users yet."
                    : "No users found matching your search."}
                </p>
              </Card>
            )}
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
