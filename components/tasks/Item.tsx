"use client";

import {
  DragOverlay,
  useDraggable,
  UseDraggableArguments,
} from "@dnd-kit/core";
import React from "react";

interface Props {
  id: string;
  data?: UseDraggableArguments["data"];
}

const KanbanItem = ({ children, id, data }: React.PropsWithChildren<Props>) => {
  const { attributes, listeners, setNodeRef, active } = useDraggable({
    id,
    data,
  });

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`rounded-sm relative cursor-grab ${
          active && active.id !== id ? "opacity-50" : ""
        }`}
      >
        {children}
      </div>
      <div>
        {active?.id === id && (
          <DragOverlay className="z-10">
            <div className="rounded-sm shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] cursor-grabbing">
              {children}
            </div>
          </DragOverlay>
        )}
      </div>
    </div>
  );
};

export default KanbanItem;
