"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CgDetailsMore } from "react-icons/cg";
import dayjs from "dayjs";
import { getDateColor } from "@/lib/get-date-colors";
import { Badge } from "../ui/badge";
import { LuClock4 } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  dueDate?: string;
  users?: {
    id: string;
    name: string;
    AvatarUrl?: string;
  }[];
}

const ProjectCard = ({ id, title, dueDate, users }: ProjectCardProps) => {
  const dueDateOptions = useMemo(() => {
    if (!dueDate) return null;
    const date = dayjs(dueDate);

    return {
      color: getDateColor({ date: dueDate }) as string,
      text: date.format("MMM DD"),
    };
  }, [dueDate]);

  const handleDeleteCard = () => {
    alert("Delete Card, Not Impelmented yet!");
  };
  const handleViewCard = () => {
    alert("View Card is not implemented");
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card>
            <CardHeader>
              <h1 className="line-clamp-1">{title}</h1>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <CgDetailsMore className="w-6 h-6" />
              {dueDateOptions && (
                <Badge
                  variant={"outline"}
                  className={`rounded-sm ${
                    dueDateOptions.color === "default" ? "bg-transparent" : ""
                  } gap-2`}
                >
                  <LuClock4 className="w-4 h-4" />
                  <p>{dueDateOptions.text}</p>
                </Badge>
              )}
              {!!users?.length && (
                <span>
                  <Avatar className="w-6 h-6 text-sm font-semibold">
                    <AvatarImage />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </span>
              )}
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem inset onClick={handleViewCard}>
            View
          </ContextMenuItem>
          <ContextMenuItem inset onClick={handleDeleteCard}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};

export default ProjectCard;

export const ProjectCardMemo = memo(ProjectCard, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.dueDate === next.dueDate &&
    prev.users?.length === next.users?.length &&
    prev.updatedAt === next.updatedAt
  );
});
