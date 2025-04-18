"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "./page";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  stageId: string | null;
  assignedUsers: string[]; // Changed to string array of user IDs
  createdAt: string;
}

interface TaskStage {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface ProjectTasksAnalyticsProps {
  projectId: string;
  adminDetails: User[];
  memberDetails: User[];
  projectRole: "admin" | "member" | "none";
  userId?: string;
}

export function ProjectTasksAnalytics({
  projectId,
  adminDetails,
  memberDetails,
  projectRole,
  userId,
}: ProjectTasksAnalyticsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksAndStages = async () => {
      try {
        setLoading(true);

        // Fetch stages
        const stagesRef = collection(FIREBASE_DB, "stages");
        const stagesSnapshot = await getDocs(stagesRef);
        const stagesData = stagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TaskStage[];
        setStages(stagesData);

        // Fetch tasks
        const tasksRef = collection(FIREBASE_DB, `projects/${projectId}/tasks`);
        let tasksQuery = query(tasksRef);

        if (projectRole === "member" && userId) {
          tasksQuery = query(
            tasksRef,
            where("assignedUsers", "array-contains", userId)
          );
        }

        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate,
            createdAt: data.createdAt?.toDate().toLocaleString() || "N/A",
            assignedUsers: data.assignedUsers || [], // Ensure array exists
          } as Task;
        });

        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndStages();
  }, [projectId, projectRole, userId]);

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded-lg"></div>;
  }

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get tasks by stage
  const tasksByStage = stages.map((stage) => ({
    stageId: stage.id,
    stageTitle: stage.title,
    count: tasks.filter((task) => task.stageId === stage.id).length,
  }));

  // Get user task statistics
  const getUserTaskStats = () => {
    const userStats: Record<
      string,
      {
        id: string;
        name: string;
        photoURL?: string;
        total: number;
        completed: number;
        overdue: number;
      }
    > = {};

    tasks.forEach((task) => {
      task.assignedUsers.forEach((userId) => {
        if (!userStats[userId]) {
          const userDetails = [...adminDetails, ...memberDetails].find(
            (user) => user.id === userId
          ) || { id: userId, name: "Unknown User" };

          userStats[userId] = {
            id: userId,
            name: userDetails.name,
            photoURL: userDetails.avatar,
            total: 0,
            completed: 0,
            overdue: 0,
          };
        }

        userStats[userId].total++;
        if (task.completed) {
          userStats[userId].completed++;
        } else if (
          task.dueDate &&
          new Date(task.dueDate) < new Date() &&
          !task.completed
        ) {
          userStats[userId].overdue++;
        }
      });
    });

    return Object.values(userStats).sort((a, b) => b.total - a.total);
  };

  const userStats = getUserTaskStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Completion Progress</span>
                <span className="text-sm font-medium">
                  {completionPercentage}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{totalTasks}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{completedTasks}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {tasks.filter((task) => !task.completed).length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {
                    tasks.filter(
                      (task) =>
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        !task.completed
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-500">Overdue</div>
              </div>
            </div>

            {stages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Tasks by Stage</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {tasksByStage.map((stage) => (
                    <div key={stage.stageId} className="border rounded-lg p-3">
                      <div className="text-sm font-medium">
                        {stage.stageTitle}
                      </div>
                      <div className="text-2xl font-bold">{stage.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {userStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats.map((user) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar>
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-sm font-medium">
                        {user.total > 0
                          ? Math.round((user.completed / user.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        user.total > 0 ? (user.completed / user.total) * 100 : 0
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{user.completed} completed</span>
                      <span>{user.overdue} overdue</span>
                      <span>
                        {user.total - user.completed - user.overdue} pending
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-500">
                    {task.dueDate ? `Due: ${task?.dueDate}` : "No due date"}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.completed
                        ? "bg-green-100 text-green-800"
                        : task.dueDate && new Date(task.dueDate) < new Date()
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.completed
                      ? "Completed"
                      : task.dueDate && new Date(task.dueDate) < new Date()
                      ? "Overdue"
                      : "Pending"}
                  </span>
                  <div className="flex -space-x-2">
                    {task.assignedUsers.slice(0, 2).map((user) => {
                      const userDetails = adminDetails.find(
                        (admin) => admin.id === user
                      ) ||
                        memberDetails.find((member) => member.id === user) || {
                          name: user,
                        };
                      return (
                        <TooltipProvider key={user}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={""} />
                                <AvatarFallback>
                                  {getInitials(userDetails.name)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{userDetails.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {task.assignedUsers.length > 2 && (
                      <Avatar className="h-6 w-6 border-2 border-white bg-gray-100">
                        <AvatarFallback className="text-xs">
                          +{task.assignedUsers.length - 2}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No tasks found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
