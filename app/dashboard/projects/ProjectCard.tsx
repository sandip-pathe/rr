import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Card } from "antd";
import { FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  admins: string[];
  members: string[];
  userRole: string;
  adminDetails: Record<string, string>;
  memberDetails: Record<string, string>;
  description?: string;
  category?: string;
  createdAt?: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface ProjectCardProps extends Project {
  onEdit: (id: string) => void;
}

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  return words.length > 1 ? words[0][0] + words[1][0] : words[0][0];
};

const colors = [
  ["#1E3A8A", "#3B82F6"],
  ["#5B21B6", "#9333EA"],
  ["#7F1D1D", "#B91C1C"],
  ["#065F46", "#10B981"],
  ["#B45309", "#F59E0B"],
  ["#374151", "#6B7280"],
  ["#1E40AF", "#60A5FA"],
  ["#991B1B", "#DC2626"],
  ["#064E3B", "#047857"],
  ["#4338CA", "#6366F1"],
];

const getGradientFromInitials = (name: string) => {
  const index =
    Math.abs(
      Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;

  return `linear-gradient(to bottom right, ${colors[index][0]}, ${colors[index][1]})`;
};

const ProjectViewCard = ({
  id,
  title,
  dueDate,
  userRole,
  admins = [],
  members = [],
  adminDetails = {},
  memberDetails = {},
  category = "",
  createdAt = "",
  onEdit,
}: ProjectCardProps) => {
  const router = useRouter();
  const initials = getInitials(title);
  const gradient = getGradientFromInitials(initials);

  // Combine admins and members with their details
  const adminUsers: User[] = admins.map((adminId) => ({
    id: adminId,
    name: adminDetails[adminId] || "Admin",
  }));

  const memberUsers: User[] = members.map((memberId) => ({
    id: memberId,
    name: memberDetails[memberId] || "Member",
  }));

  const allUsers = [...adminUsers, ...memberUsers];

  const handleCardClick = () => {
    router.push(`/dashboard/board?projectId=${id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="w-72 h-48 cursor-pointer transition-transform transform hover:scale-105 bg-cover border-none shadow-md relative overflow-hidden p-0"
      style={{ background: gradient }}
    >
      <CardHeader className="flex flex-row items-start gap-3">
        <Avatar
          className="w-14 h-14 text-2xl flex items-center rounded-none justify-center text-white font-bold border border-white shadow-md"
          style={{
            background: gradient,
            boxShadow: `0 4px 12px rgba(255, 255, 255, 0.2)`,
          }}
        >
          {initials.toUpperCase()}
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg line-clamp-1 pt-0 text-white">
            {title}
          </CardTitle>
          {category && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
              {category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="text-white space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex flex-row wrap gap-2 items-center">
            {createdAt && (
              <p className="text-xs opacity-80">
                Created: {new Date(createdAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs font-semibold">Due: {dueDate || "N/A"}</p>
          </div>
        </div>
        {allUsers.length > 0 && (
          <div className="flex justify-between items-center pt-2">
            <TooltipProvider>
              <div className="flex -space-x-2">
                {allUsers.slice(0, 3).map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="w-6 h-6 text-xs font-semibold border-2 border-white">
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
                {allUsers.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="w-6 h-6 text-xs font-semibold border-2 border-white bg-white/20">
                        <AvatarFallback>+{allUsers.length - 3}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        {allUsers.slice(3).map((user) => (
                          <p key={user.id}>{user.name}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {userRole}
            </span>
            {userRole === "admin" && (
              <FaEdit
                className="text-lg cursor-pointer opacity-80 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectViewCard;
