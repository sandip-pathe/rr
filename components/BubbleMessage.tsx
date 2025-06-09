import { Message } from "@/app/dashboard/more/[id]/page";
import { getLastSeenText } from "./DateFormat";

const MessageBubble = ({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) => (
  <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
    <div className="max-w-[80%]">
      <div
        className={`rounded-xl p-2 relative ${
          isCurrentUser ? "bg-indigo-600 text-white" : "bg-pink-600 text-white"
        }`}
      >
        <p className="leading-relaxed">{message.content}</p>
      </div>
      <div className="flex items-center justify-end mt-2">
        <span className="text-[10px] opacity-80 mr-2">
          {getLastSeenText(message.timestamp)}
        </span>
        {isCurrentUser && (
          <span className="text-[10px] opacity-80">
            {message.status === "read"
              ? "✓✓"
              : message.status === "delivered"
              ? "✓"
              : ""}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default MessageBubble;
