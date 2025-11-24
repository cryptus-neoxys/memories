import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

const MAX_MESSAGE_WIDTH_PERCENT = 75;
const TIMESTAMP_FONT_SIZE = "11px";

interface MessageBubbleProps {
  message: Message;
}

const bubbleStyles: Record<Message["role"], string> = {
  user: "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg",
  assistant:
    "bg-muted text-muted-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg",
  system: "bg-secondary text-secondary-foreground rounded-lg text-sm italic",
};

const wrapperStyles: Record<Message["role"], string> = {
  user: "justify-end text-right",
  assistant: "justify-start text-left",
  system: "justify-center text-center",
};

const avatarFallback: Record<Message["role"], string> = {
  user: "You",
  assistant: "AI",
  system: "SYS",
};

const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export function MessageBubble({ message }: MessageBubbleProps) {
  const showLeftAvatar = message.role === "assistant";
  const showRightAvatar = message.role === "user";

  return (
    <div className={cn("flex gap-2 w-full", wrapperStyles[message.role])}>
      {showLeftAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback[message.role]}</AvatarFallback>
        </Avatar>
      )}
      <div
        className="flex flex-col space-y-1"
        style={{ maxWidth: `${MAX_MESSAGE_WIDTH_PERCENT}%` }}
      >
        <div className={cn("px-4 py-2 shadow-sm", bubbleStyles[message.role])}>
          {message.content}
        </div>
        <span
          className="text-muted-foreground"
          style={{ fontSize: TIMESTAMP_FONT_SIZE }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
      {showRightAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback[message.role]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
