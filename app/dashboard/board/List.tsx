"use client";

import { KanbanBoardContainer, KanbanBoard } from "@/components/tasks/Board";
import React, { useEffect, useState } from "react";
import KanbanColumn from "@/components/tasks/Column";
import KanbanItem from "@/components/tasks/Item";
import moment from "moment";
import { ProjectCardMemo } from "@/components/tasks/Card";
import KanbanCardButton from "@/components/tasks/KanbanCardButton";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";

interface TaskNodes {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed?: Date;
  stageId: string | null;
}

interface Users {
  id: string;
  name: string;
  createdAt: Date;
}

interface Task {
  totalcount: number;
  nodes: TaskNodes[];
  users: Users;
  createdAt: Date;
  updatedAt: Date;
}

const tasks: Task = {
  totalcount: 4,
  nodes: [
    {
      id: "1",
      title: "Complete project documentation",
      description: "Document the entire project workflow and architecture.",
      dueDate: moment().add(3, "days").toDate(),
      completed: undefined, // Task is not completed yet
      stageId: "1", // "TODO"
    },
    {
      id: "2",
      title: "Set up project repository",
      description: "Initialize the repository with version control.",
      dueDate: moment().add(5, "days").toDate(),
      completed: undefined,
      stageId: "1", // "TODO"
    },
    {
      id: "3",
      title: "Review research papers",
      description: "Go through research papers for project insights.",
      dueDate: moment().add(7, "days").toDate(),
      completed: moment().subtract(1, "days").toDate(), // Task is completed
      stageId: "3", // "IN REVIEW"
    },

    {
      id: "5",
      title: "Create Excel File with New",
      description: "Organize a meeting to discuss project progress.",
      dueDate: moment().add(7, "days").toDate(),
      completed: undefined,
      stageId: "4",
    },
    {
      id: "6",
      title: "Create Excel File with New",
      description: "Organize a meeting to discuss project progress.",
      dueDate: moment().add(7, "days").toDate(),
      completed: undefined,
      stageId: "4",
    },
  ],
  users: {
    id: "u1",
    name: "John Doe",
    createdAt: moment().subtract(1, "year").toDate(),
  },
  createdAt: moment().subtract(1, "month").toDate(),
  updatedAt: moment().toDate(),
};

interface NodesStages {
  id: string;
  title: string;
}

interface Task_Stages {
  totalCount: number;
  nodes: NodesStages[];
}

const stages: Task_Stages = {
  totalCount: 4,
  nodes: [
    {
      id: "1",
      title: "TODO",
    },
    {
      id: "2",
      title: "IN PROGRESS",
    },
    {
      id: "3",
      title: "IN REVIEW",
    },
    {
      id: "4",
      title: "DONE",
    },
  ],
};

const List = () => {
  const [isLoading, setIsLoading] = useState(false);
  const taskStages = React.useMemo(() => {
    setIsLoading(true);
    if (!tasks?.nodes || !stages?.nodes) {
      setIsLoading(false);
      return {
        unassignedStage: [],
        columns: [],
      };
    }

    const unassignedStage = tasks.nodes.filter((t) => t.stageId === null);

    const grouped: any = stages.nodes.map((s) => ({
      ...s,
      tasks: tasks.nodes.filter((t) => t.stageId?.toString() === s.id) || [],
    }));
    setIsLoading(false);

    return { unassignedStage, columns: grouped };
  }, [tasks, stages]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modalId");

  useEffect(() => {
    if (modalId) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [modalId]);

  const closeModal = () => {
    router.push("/board");
    setIsModalOpen(false);
  };

  const handleAddCard = (args: { stageId: string }) => {
    router.push(`/board?modalId=${args.stageId}`);
  };

  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard>
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
              >
                <ProjectCardMemo
                  updatedAt={""}
                  {...task}
                  dueDate={task.dueDate.toString() || undefined}
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
        <Modal onClose={closeModal} isOpen={isModalOpen}>
          <div>
            <p>This is a modal for Stage ID: {modalId}</p>
          </div>
        </Modal>
      </KanbanBoardContainer>
    </>
  );
};

export default List;
