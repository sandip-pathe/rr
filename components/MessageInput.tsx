import { MdAdd, MdSend } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MessageInput = ({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form
    onSubmit={onSubmit}
    className="p-4 border-t border-gray-800 sticky bottom-0 bg-[#0d1117]/80 backdrop-blur-md"
  >
    <div className="flex items-center space-x-3">
      <button
        type="button"
        className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 transition"
      >
        <MdAdd className="text-xl text-gray-400" />
      </button>
      <Input
        type="text"
        placeholder="Type a message..."
        className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-5 py-3 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        type="submit"
        disabled={!value.trim()}
        className="bg-transparent hover:bg-transparent"
      >
        <MdSend className="text-3xl text-blue-500 hover:text-blue-700" />
      </Button>
    </div>
  </form>
);

export default MessageInput;
