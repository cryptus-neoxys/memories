"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

export function ChatList() {
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const addChat = useChatStore((state) => state.addChat);
  const selectChat = useChatStore((state) => state.selectChat);
  const deleteChat = useChatStore((state) => state.deleteChat);

  const handleNewChat = () => {
    addChat();
  };

  const formatTimestamp = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Chats</p>
          <p className="text-xs text-muted-foreground">
            {chats.length || "No"} conversations
          </p>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={handleNewChat}
          aria-label="Start new chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Create your first chat to begin.
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => selectChat(chat.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectChat(chat.id);
                }
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition hover:border-primary cursor-pointer",
                chat.id === activeChatId
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              )}
            >
              <div className="flex flex-col">
                <span
                  className="text-sm font-medium truncate"
                  title={chat.title}
                >
                  {chat.title}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {chat.updatedAt
                    ? formatTimestamp(chat.updatedAt)
                    : "New chat"}{" "}
                  - {chat.messages.length} messages
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteChat(chat.id);
                }}
                aria-label="Delete chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
