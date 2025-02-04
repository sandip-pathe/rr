"use client";

import { useDroppable, UseDroppableArguments } from "@dnd-kit/core";
import React from "react";
import { Text } from "../text";
import { Badge } from "@/components/ui/badge";
import { CiCirclePlus } from "react-icons/ci";

interface Props {
  id: string;
  title: string;
  description?: React.ReactNode;
  count: number;
  data?: UseDroppableArguments["data"];
  onAddClick?: (args: { id: string }) => void;
}

const KanbanColumn = ({
  children,
  id,
  title,
  description,
  count,
  data,
  onAddClick,
}: React.PropsWithChildren<Props>) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data,
  });

  const onAddClickHandler = () => {
    onAddClick?.({ id });
  };
  return (
    <div ref={setNodeRef} className="flex flex-col p-4">
      <div className="p-3 gap-5">
        <span className=" flex w-full flex-wrap flex-row justify-between gap-5">
          <span className="flex items-center gap-5">
            <Text className="text-white uppercase text-xs font-bold text-nowrap">
              {title}
            </Text>
            {!!count && <Badge className="bg-cyan-400">{count}</Badge>}
          </span>
          <CiCirclePlus className="w-8 h-8" onClick={onAddClickHandler} />
        </span>
        {description}
      </div>
      <div
        className={`flex-1 ${
          active ? "" : "overflow-y-auto"
        } border-2 border-dashed rounded-sm ${
          isOver ? "border-[#33ffe6]" : "border-transparent"
        }`}
      >
        <div className="mt-3 flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
};

export default KanbanColumn;
