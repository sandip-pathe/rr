import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MdChat, MdGroupAdd, MdPersonAdd } from "react-icons/md";

export default function MessagesPage() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0d1117] to-[#090c10] text-gray-300">
      <div className="text-center p-8 max-w-lg">
        <div className="mx-auto mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-800/50 flex items-center justify-center">
            <MdChat className="text-4xl text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-200">
          No chat selected
        </h2>
        <p className="mb-6 text-gray-400">
          Select a conversation or start a new chat with your team members or
          colleagues
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 rounded-full px-6 py-5"
          >
            <Link href="/dashboard/people" className="flex items-center">
              <MdPersonAdd className="mr-2" /> Find People
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full px-6 py-5">
            <Link href="/dashboard/teams" className="flex items-center">
              <MdGroupAdd className="mr-2" /> Create Team
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
