"use client";

import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import React from "react";

interface Props {
  onDragEnd: (event: DragEndEvent) => void;
}

export const KanbanBoardContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="w-[calc(100%+64px)] h-[calc(100vh-64px)] flex overflow-auto">
      <div className="w-full h-full flex p-8 overflow-auto">{children}</div>
    </div>
  );
};

export const KanbanBoard = ({
  children,
  onDragEnd,
}: React.PropsWithChildren<Props>) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);
  return (
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
      {children}
    </DndContext>
  );
};
