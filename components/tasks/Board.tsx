"use client";

import { DndContext } from "@dnd-kit/core";
import React from "react";

export const KanbanBoardContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="w-[calc(100%+64px)] h-[calc(100vh-64px)] flex overflow-auto">
      <div className="w-full h-full flex p-8 overflow-auto">{children}</div>
    </div>
  );
};

export const KanbanBoard = ({ children }: React.PropsWithChildren) => {
  return <DndContext>{children}</DndContext>;
};
