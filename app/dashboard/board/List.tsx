"use client";

import { KanbanBoardContainer, KanbanBoard } from "@/components/tasks/Board";
import React, { useEffect, useMemo, useState } from "react";
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
  or,
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
import { LuCalendarClock } from "react-icons/lu";
import { IoPersonSharp } from "react-icons/io5";
import { useAuth } from "@/app/auth/AuthContext";
import { FaInfo } from "react-icons/fa";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date | undefined;
  completed: boolean;
  stageId: string | null;
  assignedTo: string;
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
}

const getUserRole = (project: any, uid: any) => {
  if (project.admins.includes(uid)) return "admin";
  if (project.members.includes(uid)) return "member";
  return "none";
};

const uid = "ObD7YJTNQocd6uCrGk1oFWAluvy2";

const List = () => {
  const { replace } = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modalId");
  const projectIdFromUrl = searchParams.get("projectId");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projectRole, setProjectRole] = useState<"admin" | "member" | "none">(
    "none"
  );

  useEffect(() => {
    console.log("List component mounted");
    const fetchUserProjects = async () => {
      setIsLoading(true);

      const userRef = doc(FIREBASE_DB, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const projectIds = userSnap.data().projects || [];
      if (projectIds.length === 0) {
        setIsLoading(false);
        console.log("No projects found for user");
        return;
      }

      const projectDocs = await Promise.all(
        projectIds.map(async (id: string) => {
          const projectRef = doc(FIREBASE_DB, "projects", id);
          const projectSnap = await getDoc(projectRef);
          return projectSnap.exists() ? { id, ...projectSnap.data() } : null;
        })
      );

      const fetchedProjects = projectDocs.filter((p) => p !== null);
      setProjects(fetchedProjects);
      console.log("Fetched projects:", fetchedProjects);

      let projectToSelect =
        projectIdFromUrl ||
        localStorage.getItem("lastProject") ||
        fetchedProjects[0]?.id;

      if (projectToSelect) {
        setSelectedProject(projectToSelect);
        const foundProject = fetchedProjects.find(
          (p) => p.id === projectToSelect
        );
        if (foundProject) setProjectRole(getUserRole(foundProject, uid));
        localStorage.setItem("lastProject", projectToSelect);
        console.log("Selected project:", projectToSelect);
      }

      setIsLoading(false);
    };

    fetchUserProjects();
  }, []);

  const tasksRef = useMemo(() => {
    return selectedProject
      ? collection(FIREBASE_DB, "projects", selectedProject, "tasks")
      : null;
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;

    const projectRef = doc(FIREBASE_DB, "projects", selectedProject);
    console.log("Fetching tasks for project:", projectRef);
    getDoc(projectRef).then((snapshot) => {
      if (snapshot.exists()) {
        setProjectRole(getUserRole(snapshot.data() as Project, uid));
      }
    });

    console.log("tasksRef:", tasksRef);

    if (!tasksRef) return;

    const tasksQuery =
      projectRole === "admin"
        ? query(tasksRef)
        : query(tasksRef, where("assignedToIds", "array-contains", uid));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot: any) => {
      if (snapshot.empty) {
        console.warn("No tasks found for the given query.");
      }
      setTasks(
        snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      );
      console.log(
        "Fetched tasks:",
        snapshot.docs.map((doc: any) => doc.data())
      );
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedProject, projectRole, tasksRef]);

  useEffect(() => {
    const stagesRef = collection(FIREBASE_DB, "stages");
    const stageQuery = query(stagesRef);
    const unsubscribeStages = onSnapshot(stageQuery, (snapshot) => {
      const fetchedStages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskStage[];
      setStages(fetchedStages);
    });
    return () => {
      unsubscribeStages();
    };
  }, []);

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

  useEffect(() => {
    if (modalId) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [modalId]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnDragEnd = async (event: DragEndEvent) => {
    let newStageId = event.over?.id as string | undefined | null;
    const taskId = event.active.id as string;
    const currentStageId = event.active.data.current?.stageId;

    if (currentStageId === newStageId) {
      return;
    }

    const previousTasks = [...tasks];

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, stageId: newStageId ?? null } : task
      )
    );

    try {
      const taskDocRef = doc(tasksRef!, taskId);
      await updateDoc(taskDocRef, { stageId: newStageId });
      console.log(`Task ${taskId} successfully updated to stage ${newStageId}`);
    } catch (error) {
      console.error("Error updating task stage, rolling back:", error);
      setTasks(previousTasks);
    }
  };

  const handleTaskAction = (columnId: string, taskId?: string) => {
    const params = new URLSearchParams(window.location.search);

    if (taskId) {
      params.set("modalId", taskId);
      params.set("columnId", columnId);
      params.set("projectId", selectedProject);
    } else {
      params.set("modalId", "new");
      params.set("columnId", columnId);
      params.set("projectId", selectedProject);
    }
    replace(`/dashboard/board?${params.toString()}`, { scroll: false });
  };

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    const project = projects.find((proj) => proj.id === value);
    if (project) {
      setProjectRole(getUserRole(project, uid));
    }
    const params = new URLSearchParams(window.location.search);
    params.set("projectId", value);
    replace(`/dashboard/board?${params.toString()}`, { scroll: false });
  };

  const handleDelete = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    try {
      const taskDocRef = doc(tasksRef!, taskId);
      await updateDoc(taskDocRef, { stageId: null });
      console.log(`Task ${taskId} successfully deleted`);
    } catch (error) {
      console.error("Error deleting task, rolling back:", error);
      setTasks(previousTasks);
    }
  };

  return (
    <>
      <div className="flex m-0 p-3 border-b border-[#0b0b0A] justify-between items-center">
        <Select
          onValueChange={handleProjectChange}
          defaultValue={selectedProject}
        >
          <SelectTrigger className="font-bold max-w-[50%] bg-inherit border-none text-white">
            <SelectValue placeholder={selectedProject || "Select Project"} />
          </SelectTrigger>
          <SelectContent className="border-none">
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center ml-5 flex-nowrap flex-row gap-5">
          <span className="flex-row flex">
            <p className="text-sm text-gray-400">
              {projectRole === "admin" ? "Admin" : "Member"}
            </p>
          </span>
          <span className="flex-row flex">
            <FaInfo className="text-xl mr-2 text-gray-400" />
          </span>
        </div>
      </div>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          {taskStages.columns?.map((column: any) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={column.tasks.length}
              onAddClick={() => handleTaskAction(column.id)}
            >
              {!isLoading &&
                column.tasks.map((task: any) => (
                  <KanbanItem key={task.id} id={task.id} data={task}>
                    <ProjectCardMemo
                      {...task}
                      dueDate={task.dueDate || undefined}
                      onClick={() => handleTaskAction(task.stageId, task.id)}
                      onDelete={() => handleDelete(task.id)}
                    />
                  </KanbanItem>
                ))}
              {!column.tasks.length && (
                <KanbanCardButton onClick={() => handleTaskAction(column.id)} />
              )}
            </KanbanColumn>
          ))}
        </KanbanBoard>
        <TaskEditModal
          taskId={modalId || ""}
          initialData={tasks.find((task) => task.id === modalId)}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </KanbanBoardContainer>
    </>
  );
};

export default List;
