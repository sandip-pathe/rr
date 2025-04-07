"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CgDetailsMore } from "react-icons/cg";
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import { Badge } from "../ui/badge";
import { LuClock4 } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface ProjectCardProps {
  id: string;
  title: string;
  dueDate?: string | Date;
  assignedUsers?: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  onClick?: () => void;
  onDelete?: () => void;
}

type DateInfo = {
  text: string;
  color: string;
  cardColor: string;
};

const getDateInfo = (dateString?: string | Date): DateInfo | null => {
  if (!dateString) return null;

  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;
  if (!isValid(date)) return null;

  const today = new Date();
  const daysDiff = differenceInDays(date, today);

  // Default values for overdue
  let text = `Overdue by ${Math.abs(daysDiff)} day${
    Math.abs(daysDiff) !== 1 ? "s" : ""
  }`;
  let color = "bg-red-600"; // More contrast on grey background
  let cardColor = "bg-red-800/40"; // Softer transparency for a modern look

  if (daysDiff >= 0) {
    if (daysDiff === 0) {
      text = "Due today";
      color = "bg-yellow-400";
      cardColor = "bg-yellow-700/40";
    } else if (daysDiff < 3) {
      text = `Due in ${daysDiff} day${daysDiff !== 1 ? "s" : ""}`;
      color = "bg-orange-400";
      cardColor = "bg-orange-700/40";
    } else if (daysDiff < 7) {
      text = `Due in ${daysDiff} day${daysDiff !== 1 ? "s" : ""}`;
      color = "bg-blue-400";
      cardColor = "bg-blue-700/40";
    } else if (daysDiff < 30) {
      const weeks = Math.floor(daysDiff / 7);
      text = `Due in ${weeks} week${weeks !== 1 ? "s" : ""}`;
      color = "bg-green-400";
      cardColor = "bg-green-700/40";
    } else {
      text = format(date, "MMM d, yyyy");
      color = "bg-gray-400";
      cardColor = "bg-gray-700/40";
    }
  }

  return { text, color, cardColor };
};

const ProjectCard = ({
  id,
  title,
  dueDate,
  assignedUsers = [],
  onClick,
  onDelete,
}: ProjectCardProps) => {
  const dateInfo = useMemo(() => getDateInfo(dueDate), [dueDate]);

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
            key={id}
            className={`${
              dateInfo?.cardColor || "bg-[#434493]"
            } max-w-60 transition-colors`}
          >
            <CardHeader>
              <h1 className="line-clamp-2 text-white font-semibold">{title}</h1>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2 cursor-pointer">
              <CgDetailsMore className="w-6 h-6" />

              {dateInfo && (
                <Badge className={`rounded-sm ${dateInfo.color} gap-2`}>
                  <LuClock4 className="w-4 h-4" />
                  <p>{dateInfo.text}</p>
                </Badge>
              )}

              {assignedUsers.length > 0 && (
                <TooltipProvider>
                  <div className="flex -space-x-2">
                    {assignedUsers.slice(0, 3).map((user) => (
                      <Tooltip key={user.id}>
                        <TooltipTrigger>
                          <Avatar className="w-6 h-6 text-sm font-semibold border-2 border-current">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {assignedUsers.length > 3 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar className="w-6 h-6 text-xs font-semibold border-2 border-current bg-gray-600">
                            <AvatarFallback>
                              +{assignedUsers.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col gap-1">
                            {assignedUsers.slice(3).map((user) => (
                              <p key={user.id}>{user.name}</p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>
              )}
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-gray-800">
          <ContextMenuItem
            onClick={onDelete}
            className="cursor-pointer hover:text-white-100"
          >
            Delete
          </ContextMenuItem>
          <ContextMenuItem onClick={onClick}>Edit</ContextMenuItem>
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
    prev.assignedUsers?.length === next.assignedUsers?.length
  );
});
