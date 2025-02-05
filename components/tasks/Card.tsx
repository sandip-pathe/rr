"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CgDetailsMore } from "react-icons/cg";
import { format, isValid } from "date-fns";
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
  dueDate?: Date;
  users?: {
    id: string;
    name: string;
    AvatarUrl?: string;
  }[];
  onClick?: () => void;
}

const ProjectCard = ({
  id,
  title,
  dueDate,
  users,
  onClick,
}: ProjectCardProps) => {
  const dueDateOptions = useMemo(() => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (!isValid(date)) return null;

    return {
      color: getDateColor({ date: dueDate }) as string,
      text: format(date, "PPP"),
    };
  }, [dueDate]);

  return (
    <div>
      <Card onClick={onClick} key={id}>
        <CardHeader>
          <h1 className="line-clamp-1">{title}</h1>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 cursor-pointer">
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
                <AvatarImage src={users[0]?.AvatarUrl} alt={users[0]?.name} />
                <AvatarFallback>{users[0]?.name?.[0] || "CN"}</AvatarFallback>
              </Avatar>
            </span>
          )}
        </CardContent>
      </Card>
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
