"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaUsers } from "react-icons/fa";
import { MdChatBubble, MdDashboard, MdExplore } from "react-icons/md";
import { FcWorkflow } from "react-icons/fc";
import { IoMdNotifications } from "react-icons/io";
import { LuMessagesSquare } from "react-icons/lu";

const links = [
  {
    path: "/dashboard/activity",
    icon: (isActive: boolean) => (
      <IoMdNotifications
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Activity",
    priority: 1,
  },
  {
    path: "/dashboard/more",
    icon: (isActive: boolean) => (
      <MdChatBubble
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Chats",
    priority: 2,
  },
  {
    path: "/dashboard/projects",
    icon: (isActive: boolean) => (
      <MdDashboard
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Projects",
    priority: 3,
  },
  {
    path: "/dashboard/board",
    icon: (isActive: boolean) => (
      <FcWorkflow
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Board",
    priority: 6,
  },
  {
    path: "/dashboard/repo",
    icon: (isActive: boolean) => (
      <MdExplore
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "Explore",
    priority: 4,
  },
  {
    path: "/dashboard/people",
    icon: (isActive: boolean) => (
      <FaUsers
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "People",
    priority: 5,
  },
  {
    path: "/dashboard/ama",
    icon: (isActive: boolean) => (
      <LuMessagesSquare
        className={`text-xl ${isActive ? "text-blue-500" : "text-white"}`}
      />
    ),
    label: "AMA",
    priority: 7,
  },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on md and below) */}
      <aside className="hidden lg:fixed lg:flex lg:w-20 lg:h-screen bg-[#0b0b0A] text-white shadow z-40">
        <ul className="mt-12 w-full">
          {links.map((link, index) => (
            <li key={index} onClick={() => handleNavigation(link.path)}>
              <div
                className={`flex flex-col items-center hover:bg-gray-700 p-4 justify-center hover:border-l-4 hover:border-gray-700 ${
                  pathname === link.path
                    ? "bg-gray-700 border-l-4 border-indigo-400"
                    : "border-l-4 border-[#0b0b0A]"
                }`}
              >
                {link.icon(pathname === link.path)}
                <p className="text-xs mt-2">{link.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile Bottom Bar (shown on lg and below) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0b0b0A] text-white shadow z-40 h-14">
        {/* Medium devices (md) - show all 7 icons */}
        <ul className="hidden md:flex h-full justify-around items-center">
          {links.map((link, index) => (
            <li key={`md-${index}`} onClick={() => handleNavigation(link.path)}>
              <div
                className={`flex flex-col items-center justify-center p-2 w-full h-full ${
                  pathname === link.path ? "bg-gray-700" : ""
                }`}
              >
                {link.icon(pathname === link.path)}
                <p className="text-[10px] mt-1">{link.label}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Small devices (sm) - show only 5 priority icons */}
        <ul className="md:hidden flex h-full justify-around items-center px-2">
          {links
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 5)
            .map((link, index) => (
              <li
                key={`sm-${index}`}
                onClick={() => handleNavigation(link.path)}
              >
                <div
                  className={`flex flex-col items-center justify-center p-1 w-full h-full ${
                    pathname === link.path ? "bg-gray-700" : ""
                  }`}
                >
                  {link.icon(pathname === link.path)}
                  <p className="text-[10px] mt-1">{link.label}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
