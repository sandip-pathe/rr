"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "./ui/input";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/auth/AuthContext";
import { useRouter } from "next/navigation";

const Header = () => {
  const { user, logout, loading, name, role } = useAuth();
  const router = useRouter();
  const heading = "Research Repo Web App";
  const isVisible = typeof window !== "undefined" && window.innerWidth < 768;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="bg-[#0b0b0A] text-white w-screen h-12 fixed z-10 flex items-center justify-between px-4 border-b border-[#1f1f1e]">
      <div className="flex items-center">
        <div className="heading p-1 lg:ml-20">
          <Image
            src="/assets/icons/logow.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="h-10 w-fit"
          />
        </div>

        {/* Hidden on mobile, shown on medium and larger */}
        <div className="hidden md:block md:top-3 md:left-1/4 md:ml-4">
          {!isVisible && heading && (
            <div className="text-lg font-semibold line-clamp-1 text-gray-300">
              {heading}
            </div>
          )}
        </div>
      </div>

      {/* Search bar - hidden on mobile, shown on large screens */}
      <Input
        className="hidden lg:block w-96 h-8 bg-[#1f1f1e] text-white"
        placeholder="Search..."
        disabled
      />

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {loading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="flex items-center flex-col">
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{name || "User"}</p>
                <p className="text-xs">{user?.email}</p>
                <p className="text-xs text-gray-400">{role}</p>
              </div>
            </DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/me");
            }}
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/me?tab=settings");
            }}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
