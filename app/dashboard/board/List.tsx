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

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
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

const List = ({ children }: React.PropsWithChildren) => {
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
    const params = new URLSearchParams(window.location.search);
    params.delete("modalId");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
    setIsModalOpen(false); // Also update local state if needed.
  };

  const handleAddCard = (args: { stageId: string }) => {
    const params = new URLSearchParams(window.location.search);
    params.set("modalId", args.stageId === "unassigned" ? "new" : args.stageId);
    replace(`/dashboard/board?${params.toString()}`, { scroll: false });
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

  const handleCardClick = (cardId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("modalId", cardId);
    replace(`/dashboard/board?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          <KanbanColumn
            id="unassigned"
            title={"unassigned"}
            count={taskStages.unassignedStage?.length || 0}
            onAddClick={() => handleAddCard({ stageId: "unassigned" })}
          >
            {taskStages.unassignedStage.map((task) => (
              <KanbanItem
                key={task.id}
                id={task.id}
                data={{ ...task, stageId: "unassigned" }}
                onClick={() => handleCardClick(task.id)}
              >
                <ProjectCardMemo
                  updatedAt={""}
                  {...task}
                  dueDate={task.dueDate?.toString() || undefined}
                />
              </KanbanItem>
            ))}
            {!taskStages.unassignedStage.length && (
              <KanbanCardButton
                onClick={() => handleAddCard({ stageId: "unassigned" })}
              />
            )}
          </KanbanColumn>
          {taskStages.columns?.map((column: any) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={column.tasks.length}
              onAddClick={() => handleAddCard({ stageId: column.id })}
            >
              {!isLoading &&
                column.tasks.map((task: any) => (
                  <KanbanItem key={task.id} id={task.id} data={task}>
                    <ProjectCardMemo
                      {...task}
                      dueDate={task.dueDate || undefined}
                    />
                  </KanbanItem>
                ))}
              {!column.tasks.length && (
                <KanbanCardButton
                  onClick={() => handleAddCard({ stageId: column.id })}
                />
              )}
            </KanbanColumn>
          ))}
        </KanbanBoard>
        <CustomModal isOpen={isModalOpen} onClose={closeModal}>
          <div>
            <h2>Modal Content</h2>
            <p>Modal Id: {modalId}</p>
            {/* Insert additional view/edit/new content as needed */}
          </div>
        </CustomModal>
      </KanbanBoardContainer>
    </>
  );
};

export default List;
