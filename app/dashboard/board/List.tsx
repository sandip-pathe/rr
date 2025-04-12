"use client";

import { KanbanBoardContainer, KanbanBoard } from "@/components/tasks/Board";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import KanbanColumn from "@/components/tasks/Column";
import KanbanItem from "@/components/tasks/Item";
import { ProjectCardMemo } from "@/components/tasks/Card";
import KanbanCardButton from "@/components/tasks/KanbanCardButton";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { DragEndEvent } from "@dnd-kit/core";
import TaskEditModal from "@/components/taskEditForm";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/app/auth/AuthContext";
import { FaInfo } from "react-icons/fa";
import Spiner from "@/components/Spiner";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  stageId: string | null;
  assignedUsers: { id: string; name: string }[];
  createdAt: string;
}

interface TaskStage {
  id: string;
  title: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  members: string[];
  admins: string[];
  dueDate?: Date;
  createdAt: Date;
  memberDetails: Record<string, string>;
  adminDetails: Record<string, string>;
}

interface ProjectMember {
  id: string;
  name: string;
}

type ProjectRole = "admin" | "member" | "none";

const List = () => {
  const { replace } = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectRole, setProjectRole] = useState<ProjectRole>("none");
  const [memberHasNoTasks, setMemberHasNoTasks] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectAdmins, setProjectAdmins] = useState<ProjectMember[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const modalId = searchParams.get("modalId");
  const projectIdFromUrl = searchParams.get("projectId");
  const [isViewMode, setIsViewMode] = useState(false);

  const getUserRole = (project: Project, uid: string | null): ProjectRole => {
    if (!uid) return "none";
    if (project.admins.includes(uid)) return "admin";
    if (project.members.includes(uid)) return "member";
    return "none";
  };

  const setLastSelectedProject = (projectId: string) => {
    localStorage.setItem("lastProject", projectId);
  };

  const getLastSelectedProject = () => {
    return localStorage.getItem("lastProject");
  };

  const selectedProjectData = useMemo(() => {
    return projects.find((p) => p.id === selectedProject);
  }, [projects, selectedProject]);

  const tasksRef = useMemo(() => {
    return selectedProject
      ? collection(FIREBASE_DB, "projects", selectedProject, "tasks")
      : null;
  }, [selectedProject]);

  const taskStages = useMemo(() => {
    if (!tasks.length || !stages.length) {
      return { unassignedStage: [], columns: [] };
    }
    const unassignedStage = tasks.filter((task) => !task.stageId);
    const columns = stages.map((stage) => ({
      ...stage,
      tasks: tasks.filter((task) => task.stageId === stage.id),
    }));
    return { unassignedStage, columns };
  }, [tasks, stages]);

  const transformMemberData = (
    members: Record<string, string> | undefined
  ): ProjectMember[] => {
    if (!members) return [];
    return Object.entries(members).map(([id, name]) => ({ id, name }));
  };

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchUserProjects = async () => {
      setUserId(user.uid);
      setIsLoading(true);
      try {
        const userRef = doc(FIREBASE_DB, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn("User document not found");
          return;
        }

        const projectIds = userSnap.data().projects || [];
        if (projectIds.length === 0) {
          console.log("No projects found for user");
          return;
        }

        const projectDocs = await Promise.all(
          projectIds.map(async (id: string) => {
            const projectRef = doc(FIREBASE_DB, "projects", id);
            const projectSnap = await getDoc(projectRef);
            if (!projectSnap.exists()) return null;

            const projectData = projectSnap.data();
            return {
              id,
              ...projectData,
              memberDetails: projectData.memberDetails || {},
              adminDetails: projectData.adminDetails || {},
            } as Project;
          })
        );

        const fetchedProjects = projectDocs.filter(
          (p): p is Project => p !== null
        );
        setProjects(fetchedProjects);

        // Determine which project to select
        let projectToSelect = projectIdFromUrl || getLastSelectedProject();

        // If no project specified, try to use the first one
        if (!projectToSelect && fetchedProjects.length > 0) {
          projectToSelect = fetchedProjects[0].id;
        }

        if (projectToSelect) {
          // Find the project in fetched projects
          const project = fetchedProjects.find((p) => p.id === projectToSelect);
          if (project) {
            setSelectedProject(project.id);
            setProjectRole(getUserRole(project, user.uid));
            setLastSelectedProject(project.id);
            updateUrlParams({ projectId: project.id });
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, [authLoading, projectIdFromUrl]);

  useEffect(() => {
    if (!selectedProject || !userId) return;

    const fetchProjectAndTasks = async () => {
      try {
        setIsLoading(true);

        // Get fresh project data to ensure we have the correct role
        const projectRef = doc(FIREBASE_DB, "projects", selectedProject);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          console.warn("Project not found");
          return;
        }

        const projectData = projectSnap.data() as Project;
        const currentRole = getUserRole(projectData, userId);
        setProjectRole(currentRole);

        if (!tasksRef) return;

        // For admins, get all tasks
        if (currentRole === "admin") {
          const unsubscribe = onSnapshot(query(tasksRef), (snapshot) => {
            const fetchedTasks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Task[];

            setTasks(fetchedTasks);
            setIsLoading(false);
          });
          return unsubscribe;
        }
        // For members, filter tasks where assignedUsers contains their ID
        else if (currentRole === "member") {
          const unsubscribe = onSnapshot(query(tasksRef), (snapshot) => {
            const fetchedTasks = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((task) => {
                // Check if assignedUsers array contains a user with matching ID
                return (task as Task).assignedUsers?.some(
                  (user: { id: string }) => user.id === userId
                );
              }) as Task[];

            setMemberHasNoTasks(fetchedTasks.length === 0);
            setTasks(fetchedTasks);
            setIsLoading(false);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setIsLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [selectedProject, refreshTrigger]);

  useEffect(() => {
    const fetchStages = () => {
      try {
        const stagesRef = collection(FIREBASE_DB, "stages");
        const stageQuery = query(stagesRef);

        const unsubscribeStages = onSnapshot(stageQuery, (snapshot) => {
          const fetchedStages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TaskStage[];
          setStages(fetchedStages);
        });

        return unsubscribeStages;
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };

    fetchStages();
  }, []);

  useEffect(() => {
    setIsModalOpen(!!modalId);
  }, [modalId]);

  useEffect(() => {
    if (!selectedProjectData) return;

    setProjectMembers(transformMemberData(selectedProjectData.memberDetails));
    setProjectAdmins(transformMemberData(selectedProjectData.adminDetails));
  }, [selectedProjectData]);

  // Handle project selection
  const handleProjectSelection = useCallback(
    (projectId: string, projectsList: Project[] = projects) => {
      const project = projectsList.find((p) => p.id === projectId);
      if (!project) return;

      setSelectedProject(projectId);
      setProjectRole(getUserRole(project, userId));
      setLastSelectedProject(projectId);
      updateUrlParams({ projectId });
    },
    [projects, userId]
  );

  const handleOnDragEnd = async (event: DragEndEvent) => {
    const newStageId = event.over?.id as string | undefined | null;
    const taskId = event.active.id as string;
    const currentStageId = event.active.data.current?.stageId;

    if (currentStageId === newStageId || !tasksRef) return;

    const previousTasks = [...tasks];

    try {
      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, stageId: newStageId ?? null } : task
        )
      );

      // Update in Firestore
      const taskDocRef = doc(tasksRef, taskId);
      await updateDoc(taskDocRef, { stageId: newStageId });
    } catch (error) {
      console.error("Error updating task stage:", error);
      // Rollback on error
      setTasks(previousTasks);
    }
  };

  const handleTaskAction = useCallback(
    (columnId: string, taskId?: string) => {
      const newParams = new URLSearchParams(window.location.search);
      newParams.set("columnId", columnId);
      newParams.set("projectId", selectedProject);
      newParams.set("modalId", taskId || "new");

      // This prevents full page reload while updating URL
      window.history.pushState(null, "", `?${newParams.toString()}`);
      setIsModalOpen(true);
    },
    [selectedProject]
  );

  const handleViewTask = useCallback(
    (columnId: string, taskId?: string) => {
      const newParams = new URLSearchParams(window.location.search);
      newParams.set("columnId", columnId);
      newParams.set("projectId", selectedProject);
      newParams.set("modalId", taskId || "new");

      window.history.pushState(null, "", `?${newParams.toString()}`);
      setIsViewMode(true);
      setIsModalOpen(true);
    },
    [selectedProject]
  );

  const handleDelete = async (taskId: string) => {
    if (!tasksRef) return;
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      // Update in Firestore
      const taskDocRef = doc(tasksRef, taskId);
      await updateDoc(taskDocRef, { stageId: null });
    } catch (error) {
      console.error("Error deleting task:", error);
      // Rollback on error
      setTasks(previousTasks);
    }
  };

  const updateUrlParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    replace(`/dashboard/board?${newParams.toString()}`, { scroll: false });
  };

  const closeModal = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("modalId");
    params.delete("columnId");
    window.history.replaceState(null, "", `?${params.toString()}`);
    setIsModalOpen(false);
    setIsViewMode(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spiner />
      </div>
    );
  }

  if (projects.length === 0 && !isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex m-0 p-3 justify-between items-center">
        <div className="flex items-center gap-4">
          <Select
            onValueChange={handleProjectSelection}
            value={selectedProject}
            disabled={isLoading || projects.length === 0}
          >
            <SelectTrigger className="font-bold max-w-[350px] bg-transparent">
              <SelectValue
                placeholder={
                  isLoading
                    ? "Loading..."
                    : projects.length === 0
                    ? "No projects"
                    : "Select Project"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProject && (
            <Badge variant={projectRole === "admin" ? "default" : "secondary"}>
              {projectRole === "admin" ? "Admin" : "Member"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-row">
          <FaInfo className="text-muted-foreground hover:text-foreground transition-colors" />
        </div>
      </div>

      <KanbanBoardContainer>
        {!isLoading &&
        (tasks.length === 0 ||
          (projectRole === "member" && memberHasNoTasks)) ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 p-8 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {projectRole === "admin"
                ? "No tasks created yet"
                : "No tasks assigned to you yet"}
            </p>
          </div>
        ) : (
          <KanbanBoard onDragEnd={handleOnDragEnd}>
            {taskStages.columns?.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={column.tasks.length}
                onAddClick={() => handleTaskAction(column.id)}
              >
                {column.tasks.map((task) => (
                  <KanbanItem key={task.id} id={task.id} data={task}>
                    <ProjectCardMemo
                      {...task}
                      dueDate={task.dueDate}
                      onClick={() =>
                        handleTaskAction(task.stageId || "", task.id)
                      }
                      onView={() => handleViewTask(task.stageId || "", task.id)}
                      onDelete={() => handleDelete(task.id)}
                      projectRole={projectRole}
                    />
                  </KanbanItem>
                ))}
                {!column.tasks.length && (
                  <KanbanCardButton
                    onClick={() => handleTaskAction(column.id)}
                  />
                )}
              </KanbanColumn>
            ))}
          </KanbanBoard>
        )}

        <TaskEditModal
          key={modalId || "new"}
          taskId={modalId || ""}
          initialData={tasks.find((task) => task.id === modalId)}
          isOpen={isModalOpen}
          onClose={closeModal}
          projectMembers={projectMembers}
          projectAdmins={projectAdmins}
          role={projectRole}
          viewOnly={isViewMode}
        />
      </KanbanBoardContainer>
    </div>
  );
};

export default List;
