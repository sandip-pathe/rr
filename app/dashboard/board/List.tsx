"use client";

import { KanbanBoardContainer, KanbanBoard } from "@/components/tasks/Board";
import React, { useEffect, useState } from "react";
import KanbanColumn from "@/components/tasks/Column";
import KanbanItem from "@/components/tasks/Item";
import { ProjectCardMemo } from "@/components/tasks/Card";
import KanbanCardButton from "@/components/tasks/KanbanCardButton";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { DragEndEvent } from "@dnd-kit/core";
import CustomModal from "@/components/ModalWrapper";
import TaskEditModal from "@/components/taskEditForm";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date | undefined;
  completed: boolean;
  stageId: string | null;
  // users: string[];
  // admins: string[];
}

interface TaskStage {
  id: string;
  title: string;
}

const tasksRef = collection(
  FIREBASE_DB,
  "projects",
  "JMZrskwo5m2w2e6upcfa",
  "tasks"
);
const stagesRef = collection(
  FIREBASE_DB,
  "projects",
  "JMZrskwo5m2w2e6upcfa",
  "stages"
);

const List = () => {
  const { replace } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modalId");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<TaskStage[]>([]);

  useEffect(() => {
    const taskQuery = query(tasksRef);
    const stageQuery = query(stagesRef);

    // Listen for real-time updates on tasks
    const unsubscribeTasks = onSnapshot(taskQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(fetchedTasks);
      console.log(fetchedTasks);
      setIsLoading(false);
    });

    // Listen for real-time updates on stages
    const unsubscribeStages = onSnapshot(stageQuery, (snapshot) => {
      const fetchedStages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskStage[];
      setStages(fetchedStages);
      console.log(fetchedStages);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeStages();
    };
  }, []);

  const taskStages = React.useMemo(() => {
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
    if (newStageId === "unassigned") {
      newStageId = null;
    }

    const previousTasks = [...tasks];

    // Update local tasks state optimistically
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
