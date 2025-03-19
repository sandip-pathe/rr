"use client";

import React from "react";
import { Button } from "../ui/button";
import { PlusCircleIcon } from "lucide-react";

interface Props {
  onClick: () => void;
}

const KanbanCardButton = ({
  children,
  onClick,
}: React.PropsWithChildren<Props>) => {
  return (
    <Button
      className="hover:bg-gray-700 text-lg rounded-sm bg-transparent"
      onClick={onClick}
    >
      {children ?? (
        <span className="flex flex-row gap-2 items-center">
          <PlusCircleIcon className="text-white" />
          <p className="text-md text-white">Add New</p>
        </span>
      )}
    </Button>
  );
};

export default KanbanCardButton;
