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
import { usePageHeading } from "@/app/auth/PageHeadingContext";
import { useState } from "react";

const Header = () => {
  const { user, logout, loading, name, role } = useAuth();
  const router = useRouter();
  const { heading, isVisible } = usePageHeading();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="bg-[#0b0b0A] text-white w-screen h-12 fixed z-10 flex-row flex justify-between pl-4 pr-4 border-b border-[#1f1f1e]">
      <div className="heading p-1 ml-20">
        <Image
          src="/assets/icons/logow.svg"
          height={1000}
          width={1000}
          alt="logo"
          className="h-10 w-fit"
        />
      </div>

      <div className="top-3 fixed left-1/4">
        {!isVisible && heading && (
          <div className="absolute w-40 transform -translate-x-1/2 text-lg font-semibold line-clamp-1 text-gray-300">
            {heading}
          </div>
        )}
      </div>

      <Input
        className="w-96 h-8 m-2 bg-[#1f1f1e] text-white"
        placeholder="Search (Alt+Shift+E)"
      />

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8 m-2">
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
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
