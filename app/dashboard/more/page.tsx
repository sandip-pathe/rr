import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1a1b1b] text-gray-300">
      <div className="text-center p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4">No chat selected</h2>
        <p className="mb-6 text-gray-400">
          Start a conversation by selecting a person or group from the sidebar.
          or find new people to chat with.
        </p>
      </div>
    </div>
  );
}
