"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaUsers, FaCalendar } from "react-icons/fa";
import { CgUserlane } from "react-icons/cg";
import { MdDashboard, MdMoreHoriz } from "react-icons/md";
import { FcWorkflow } from "react-icons/fc";
import { IoMdNotifications } from "react-icons/io";
import { LuMessagesSquare } from "react-icons/lu";

const links = [
  {
    path: "/dashboard",
    icon: (isActive: boolean) => (
      <IoMdNotifications
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Activity",
  },
  {
    path: "/dashboard/projects",
    icon: (isActive: boolean) => (
      <MdDashboard
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Projects",
  },
  {
    path: "/dashboard/board",
    icon: (isActive: boolean) => (
      <FcWorkflow
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Board",
  },
  {
    path: "/dashboard/calendar",
    icon: (isActive: boolean) => (
      <FaCalendar
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Calendar",
  },
  {
    path: "/dashboard/people",
    icon: (isActive: boolean) => (
      <FaUsers
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "People",
  },
  {
    path: "/dashboard/me",
    icon: (isActive: boolean) => (
      <CgUserlane
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Me",
  },
  {
    path: "/dashboard/community",
    icon: (isActive: boolean) => (
      <LuMessagesSquare
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "AMA",
  },
  {
    path: "/dashboard/more",
    icon: (isActive: boolean) => (
      <MdMoreHoriz
        className={`text-xl mr-2 ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
  },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside className="fixed w-20 h-screen bg-[#0b0b0A] text-white shadow">
      <ul className="mt-12">
        {links.map((link, index) => (
          <li key={index} onClick={() => handleNavigation(link.path)}>
            <div
              className={`items-center hover:bg-gray-700 p-4 justify-center hover:border-l-4 hover:border-gray-700 ${
                pathname === link.path
                  ? "bg-gray-700 border-l-4 border-indigo-500"
                  : "border-l-4 border-[#0b0b0A]"
              }`}
            >
              {link.icon(pathname === link.path)}
              <p className="text-xs">{link.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
