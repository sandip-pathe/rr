"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import Layout from "@/components/Layout";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaEdit,
  FaUsers,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaComment,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project, Comment } from "@/types/project";
import { ProjectTasksAnalytics } from "./TaskAnalytics";
import { useToast } from "@/hooks/use-toast";

type ProjectRole = "admin" | "member" | "none";

const colors = [
  ["#1E3A8A", "#3B82F6"],
  ["#5B21B6", "#9333EA"],
  ["#7F1D1D", "#B91C1C"],
  ["#065F46", "#10B981"],
  ["#B45309", "#F59E0B"],
  ["#374151", "#6B7280"],
  ["#1E40AF", "#60A5FA"],
  ["#991B1B", "#DC2626"],
  ["#064E3B", "#047857"],
  ["#4338CA", "#6366F1"],
];

export const getInitials = (name?: string) => {
  if (!name) return "?"; // Return "?" if name is undefined or empty

  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?"; // Handle empty string case

  // Return first letter of first word + first letter of second word (if exists)
  return words.length > 1
    ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
    : words[0][0].toUpperCase();
};

const getGradientFromInitials = (name: string) => {
  const index =
    Math.abs(
      Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;
  return `linear-gradient(to bottom right, ${colors[index][0]}, ${colors[index][1]})`;
};

interface User {
  id: string;
  name: string;
  avatar?: string;
}

export default function ProjectDetails() {
  const { projectid: projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<ProjectRole>("none");
  const [commentText, setCommentText] = useState("");
  const [showPublicComment, setShowPublicComment] = useState(true);
  const [showPrivateComments, setShowPrivateComments] = useState(false);
  const { user, name } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const adminUsers: User[] = (project?.admins ?? []).map((adminId) => ({
    id: adminId,
    name: project?.adminDetails[adminId] || "Admin",
  }));

  const memberUsers: User[] = (project?.members ?? []).map((memberId) => ({
    id: memberId,
    name: project?.memberDetails[memberId] || "Member",
  }));

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !user?.uid) return;

      try {
        setLoading(true);
        const projectRef = doc(FIREBASE_DB, "projects", projectId as string);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          throw new Error("Project not found");
        }

        const data = projectSnap.data();
        const role = getUserRole(data, user.uid);

        // Fetch all comments (we'll filter them based on visibility)
        const commentsQuery = query(
          collection(FIREBASE_DB, `projects/${projectId}/comments`)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString(),
        })) as Comment[];

        const projectData: Project = {
          id: projectSnap.id,
          title: data.title || "Untitled",
          status: data.status || "Ongoing",
          dueDate: data.dueDate?.toDate().toLocaleDateString() || "N/A",
          createdAt: data.createdAt?.toDate().toLocaleDateString() || "N/A",
          admins: data.admins || [],
          members: data.members || [],
          adminDetails: data.adminDetails || {},
          memberDetails: data.memberDetails || {},
          description: data.description || "",
          category: data.category || "",
          isPublic: data.isPublic || false,
          likes: data.likes || [],
          comments: comments,
        };

        setProject(projectData);
        setUserRole(role);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user?.uid]);

  const getUserRole = (projectData: any, uid: string): ProjectRole => {
    if (!uid) return "none";
    if (projectData.admins?.includes(uid)) return "admin";
    if (projectData.members?.includes(uid)) return "member";
    return "none";
  };

  const handleLikeProject = async () => {
    if (!user?.uid || !project) return;

    try {
      const projectRef = doc(FIREBASE_DB, "projects", project.id);
      const newLikes = project.likes.includes(user.uid)
        ? project.likes.filter((id) => id !== user.uid)
        : [...project.likes, user.uid];

      await updateDoc(projectRef, { likes: newLikes });
      setProject({ ...project, likes: newLikes });
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleAddComment = async () => {
    if (!user?.uid || !project || !commentText.trim()) return;

    try {
      const commentsRef = collection(
        FIREBASE_DB,
        `projects/${project.id}/comments`
      );
      const newComment = {
        userId: user.uid,
        userDetails: {
          name: name || "Anonymous",
          photoURL: user.photoURL || "",
        },
        text: commentText,
        createdAt: serverTimestamp(),
        isPublic: showPublicComment,
      };

      await addDoc(commentsRef, newComment);
      setCommentText("");

      // Refresh comments
      const commentsQuery = query(
        collection(FIREBASE_DB, `projects/${project.id}/comments`)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const updatedComments = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      })) as Comment[];

      setProject({ ...project, comments: updatedComments });
      toast({
        title: "Added Comment",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleJoinRequest = async () => {
    if (!user?.uid || !project) return;

    try {
      toast({
        title: "Request Sent",
        description: "Your request to join the project has been sent.",
      });
    } catch (error) {
      console.error("Error sending join request:", error);
    }
  };

  const handleEditProject = () => {
    router.push(`/dashboard/projects?projectId=${projectId}`);
  };

  const filteredComments = () => {
    if (!project?.comments) return [];

    // For admin/member, show all or filtered based on toggle
    if (userRole === "admin" || userRole === "member") {
      return showPrivateComments
        ? project.comments
        : project.comments.filter((comment) => comment.isPublic);
    }

    // For none role, only show public comments if project is public
    return project.comments.filter((comment) => comment.isPublic);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-40 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </Layout>
    );
  }

  const initials = getInitials(project.title);
  const gradient = getGradientFromInitials(initials);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-gray-500">
              {project.category} • Due {project.dueDate}
            </p>
          </div>
          {userRole === "admin" && (
            <Button onClick={handleEditProject} variant="outline">
              <FaEdit className="mr-2" /> Edit Project
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{project.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>People</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Admins</h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(adminUsers).map(([id, user]) => (
                        <div key={id} className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Members</h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(memberUsers).map(([id, user]) => (
                        <TooltipProvider key={id}>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center space-x-2">
                                <Avatar>
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.id}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Comments</CardTitle>
                  {/* Only show toggle button for admin/member */}
                  {(userRole === "admin" || userRole === "member") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowPrivateComments(!showPrivateComments)
                      }
                    >
                      {showPrivateComments ? (
                        <>
                          <FaEyeSlash className="mr-2" /> Hide Private
                        </>
                      ) : (
                        <>
                          <FaEye className="mr-2" /> Show Private
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show comment input for everyone if project is public, or for members/admins */}
                  {(userRole === "admin" ||
                    userRole === "member" ||
                    userRole === "none") && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="public-comment"
                            checked={showPublicComment}
                            onChange={() =>
                              setShowPublicComment(!showPublicComment)
                            }
                          />
                          <label htmlFor="public-comment">Public comment</label>
                        </div>
                        <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim()}
                          size="sm"
                        >
                          <FaComment className="mr-2" /> Post
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Show comments */}
                  {filteredComments().length > 0 ? (
                    <div className="space-y-4">
                      {filteredComments().map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar>
                            <AvatarImage src={comment.userDetails.photoURL} />
                            <AvatarFallback>
                              {getInitials(comment.userDetails.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="font-medium">
                                {comment.userDetails.name}
                                {!comment.isPublic && (
                                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                    Private
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {comment.createdAt}
                              </div>
                            </div>
                            <p className="mt-1">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No comments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{project.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{project.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{project.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Visibility</p>
                    <p className="font-medium">
                      {project.isPublic ? "Public" : "Private"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLikeProject}
                  >
                    {project.likes.includes(user?.uid || "") ? (
                      <>
                        <FaHeart className="mr-2 text-red-500" /> Liked
                      </>
                    ) : (
                      <>
                        <FaRegHeart className="mr-2" /> Like
                      </>
                    )}
                    <span className="ml-2">{project.likes.length}</span>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FaShare className="mr-2" /> Share
                  </Button>
                  {userRole === "none" && project.isPublic && (
                    <Button onClick={handleJoinRequest} className="w-full">
                      <FaUsers className="mr-2" /> Request To Join Project
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {userRole === "admin" && (
          <div className="mt-8">
            <ProjectTasksAnalytics
              projectId={project.id}
              adminDetails={adminUsers}
              memberDetails={memberUsers}
              projectRole={userRole}
              userId={user?.uid}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
