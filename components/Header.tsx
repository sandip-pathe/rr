import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Input } from "./ui/input";

const Header = () => {
  return (
    <header className="bg-[#0b0b0A] text-white w-screen h-12 fixed z-10 flex-row flex justify-between pl-4 pr-4 border-b	 border-[#1f1f1e]">
      <div className="heading pt-2 ml-20">
        <h1 className="text-[#1f1f1e] text-xl ">RESEARCH</h1>
      </div>
      <Input
        className="w-96 h-8 m-2 bg-[#1f1f1e] text-white"
        placeholder="Search (Alt+Shift+E)"
      />
      <Avatar className="h-8 w-8 m-2">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </header>
  );
};

export default Header;
