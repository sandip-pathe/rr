"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaUsers } from "react-icons/fa";
import { MdDashboard, MdExplore } from "react-icons/md";
import { IoMdNotifications } from "react-icons/io";
import { LuMessagesSquare, LuWorkflow } from "react-icons/lu";
import { BsFillChatSquareFill } from "react-icons/bs";

const links = [
  {
    path: "/dashboard/activity",
    icon: (isActive: boolean) => <IoMdNotifications />,
    label: "Activity",
    priority: 1,
  },
  {
    path: "/dashboard/more",
    icon: (isActive: boolean) => <BsFillChatSquareFill />,
    label: "Chats",
    priority: 2,
  },
  {
    path: "/dashboard/projects",
    icon: (isActive: boolean) => <MdDashboard />,
    label: "Projects",
    priority: 3,
  },
  {
    path: "/dashboard/board",
    icon: (isActive: boolean) => <LuWorkflow />,
    label: "Board",
    priority: 6,
  },
  {
    path: "/dashboard/repo",
    icon: (isActive: boolean) => <MdExplore />,
    label: "Explore",
    priority: 4,
  },
  {
    path: "/dashboard/people",
    icon: (isActive: boolean) => <FaUsers />,
    label: "People",
    priority: 5,
  },
  {
    path: "/dashboard/ama",
    icon: (isActive: boolean) => <LuMessagesSquare />,
    label: "AMA",
    priority: 7,
  },
];

const boxColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-yellow-500",
  "bg-pink-500",
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:flex lg:w-20 lg:h-screen bg-[#101a23] text-white shadow lg:flex-col lg:items-center lg:justify-start z-40">
        <ul className="mt-12 w-full flex flex-col items-center">
          {links.map((link, index) => {
            const isActive = pathname === link.path;
            const boxColor = boxColors[index % boxColors.length];
            return (
              <li
                key={index}
                onClick={() => handleNavigation(link.path)}
                className="relative group flex justify-center w-full cursor-pointer"
              >
                <div
                  className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-200 relative`}
                >
                  {/* Icon Box */}
                  <div
                    className={`rounded-xl p-2 ${boxColor} flex items-center justify-center`}
                  >
                    <div className={`text-3xl`}>{link.icon(isActive)}</div>
                  </div>

                  {isActive && (
                    <div className="absolute right-2 top-2 w-1 h-12 rounded-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500" />
                  )}

                  {/* Label */}
                  <p className="text-[12px] mt-2">{link.label}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#101a23] text-white shadow z-40 h-16">
        {/* Medium devices (md) - show all 7 icons */}
        <ul className="hidden md:flex h-full justify-around items-center px-1">
          {links.map((link, index) => {
            const isActive = pathname === link.path;
            const boxColor = boxColors[index % boxColors.length];
            return (
              <li
                key={`md-${index}`}
                className="flex-1 flex justify-center"
                onClick={() => handleNavigation(link.path)}
              >
                <div
                  className={`flex flex-col items-center justify-center w-full h-full p-1 relative ${
                    isActive ? "bg-gray-700/30" : ""
                  }`}
                >
                  {/* Icon Box - smaller size for mobile */}
                  <div
                    className={`rounded-xl p-1.5 ${boxColor} flex items-center justify-center`}
                  >
                    <div className="text-xl">{link.icon(isActive)}</div>
                  </div>

                  {/* Label */}
                  <p className="text-[10px] mt-1">{link.label}</p>

                  {/* Active indicator - bottom bar */}
                  {isActive && (
                    <div className="absolute bottom-0 w-8 h-1 rounded-t-full bg-gradient-to-r from-purple-500 to-blue-500" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Small devices (sm) - show only 5 priority icons */}
        <ul className="md:hidden flex h-full justify-around items-center px-1">
          {links
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 5)
            .map((link, index) => {
              const isActive = pathname === link.path;
              const boxColor = boxColors[link.priority % boxColors.length];
              return (
                <li
                  key={`sm-${index}`}
                  className="flex-1 flex justify-center"
                  onClick={() => handleNavigation(link.path)}
                >
                  <div
                    className={`flex flex-col items-center justify-center w-full h-full p-1 relative ${
                      isActive ? "bg-gray-700/30" : ""
                    }`}
                  >
                    {/* Icon Box - smaller size for mobile */}
                    <div
                      className={`rounded-xl p-1.5 ${boxColor} flex items-center justify-center`}
                    >
                      <div className="text-xl">{link.icon(isActive)}</div>
                    </div>

                    {/* Label */}
                    <p className="text-[10px] mt-1">{link.label}</p>

                    {/* Active indicator - bottom bar */}
                    {isActive && (
                      <div className="absolute bottom-0 w-8 h-1 rounded-t-full bg-gradient-to-r from-purple-500 to-blue-500" />
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
