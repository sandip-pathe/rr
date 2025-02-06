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

const getUserRole = (
  project: Project,
  uid: string
): "admin" | "member" | "none" => {
  if (project.admins.includes(uid)) return "admin";
  if (project.members.includes(uid)) return "member";
  return "none";
};

const uid = "ObD7YJTNQocd6uCrGk1oFWAluvy2";

const tasksRef = collection(
  FIREBASE_DB,
  "projects",
  "collabhub---the-ultimate-project-management-&-networking-platform-1738846460935",
  "tasks"
);

const List = () => {
  const { replace } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modalId");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(""); // will store project id
  const [projectRole, setProjectRole] = useState<"admin" | "member" | "none">(
    "none"
  );

  useEffect(() => {
    if (!uid) return;
    const projectsRef = collection(FIREBASE_DB, "projects");
    const projectsQuery = query(
      projectsRef,
      or(
        where("admins", "array-contains", uid),
        where("members", "array-contains", uid)
      )
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const fetchedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      setProjects(fetchedProjects);

      if (!selectedProject && fetchedProjects.length) {
        setSelectedProject(fetchedProjects[0].id);
        setProjectRole(getUserRole(fetchedProjects[0], uid));
      }
    });

    return () => {
      unsubscribeProjects();
    };
  }, [uid, selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    const currentProject = projects.find((proj) => proj.id === selectedProject);
    if (currentProject) {
      setProjectRole(getUserRole(currentProject, uid));
    }
    const tasksRef = collection(
      FIREBASE_DB,
      "projects",
      selectedProject,
      "tasks"
    );
    const taskQuery = query(tasksRef);
    setIsLoading(true);
    const unsubscribeTasks = onSnapshot(taskQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(fetchedTasks);
      setIsLoading(false);
    });

    return () => {
      unsubscribeTasks();
    };
  }, [selectedProject, uid, projects]);

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
      const taskDocRef = doc(tasksRef, taskId);
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
    } else {
      params.set("modalId", "new");
      params.set("columnId", columnId);
    }
    replace(`/dashboard/board?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="flex m-0 p-3 border-b border-[#0b0b0A] justify-start">
        <Select
          onValueChange={(value) => {
            setSelectedProject(value);
            const project = projects.find((proj) => proj.id === value);
            if (project) {
              setProjectRole(getUserRole(project, uid));
            }
          }}
          defaultValue={selectedProject}
        >
          <SelectTrigger className="font-bold w-[240px] mr-5 gap-3 bg-inherit border-none text-white">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent className="border-none">
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title.slice(0, 20)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center ml-5 flex-nowrap flex-row gap-5">
          <span className="flex-row flex">
            <IoPersonSharp className="text-2xl mr-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              {projectRole === "admin" ? "Admin" : "Member"}
            </p>
          </span>
          <span className="flex-row flex">
            <LuCalendarClock className="text-2xl mr-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              March 15, 2025 at 12:00:00 AM UTC+5:30
            </p>
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
