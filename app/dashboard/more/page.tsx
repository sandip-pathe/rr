import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1a1b1b] text-gray-300">
      <div className="text-center p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4">No chat selected</h2>
        <p className="mb-6">
          Select an existing chat from the sidebar or start a new conversation
        </p>
        <Link href="/dashboard/more">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Find people to chat with
          </Button>
        </Link>
      </div>
    </div>
  );
}
