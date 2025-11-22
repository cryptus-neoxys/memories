"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/chat-store";
import type { Message } from "@/lib/types";
import { MessageBubble } from "@/components/message-bubble";

interface ChatInterfaceProps {
  onSendMessage?: (payload: {
    chatId: string;
    message: Message;
  }) => Promise<void>;
  isStreaming?: boolean;
}

export function ChatInterface({
  onSendMessage,
  isStreaming = false,
}: ChatInterfaceProps) {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const chats = useChatStore((state) => state.chats);
  const addChat = useChatStore((state) => state.addChat);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateChat = useChatStore((state) => state.updateChat);

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [activeChat?.messages.length]);

  const ensureActiveChat = useCallback(() => {
    if (activeChat) return activeChat.id;
    return addChat();
  }, [activeChat, addChat]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const chatId = ensureActiveChat();
    const timestamp = new Date().toISOString();
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: trimmed,
      timestamp,
    };

    addMessage(chatId, userMessage);
    setInputValue("");

    if (onSendMessage) {
      try {
        setIsSending(true);
        await onSendMessage({ chatId, message: userMessage });
      } finally {
        setIsSending(false);
      }
      return;
    }

    setIsSending(true);
    const assistantMessageId = nanoid();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    addMessage(chatId, assistantMessage);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messages: [...(activeChat?.messages || []), userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        accumulatedContent += text;

        updateChat(chatId, (chat) => {
          const messages = [...chat.messages];
          const lastMsgIndex = messages.findIndex(
            (m) => m.id === assistantMessageId
          );
          if (lastMsgIndex !== -1) {
            messages[lastMsgIndex] = {
              ...messages[lastMsgIndex],
              content: accumulatedContent,
            };
          }
          return { ...chat, messages };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  }, [
    addMessage,
    ensureActiveChat,
    inputValue,
    onSendMessage,
    activeChat,
    updateChat,
  ]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const renderEmptyState = () => (
    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
      Start a conversation to teach Bhindi about your preferences.
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <p className="text-sm font-medium">
            {activeChat?.title ?? "No active chat"}
          </p>
          <p className="text-xs text-muted-foreground">
            {activeChat
              ? `${activeChat.messages.length} messages stored`
              : "Create or select a chat to begin"}
          </p>
        </div>
      </div>

      <ScrollArea
        className="flex-1 rounded-md border"
        viewportRef={viewportRef}
      >
        <div className="space-y-4 p-4">
          {activeChat?.messages.length
            ? activeChat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            : renderEmptyState()}
        </div>
      </ScrollArea>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <Input
          placeholder="Share context, preferences, or tasks..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming || isSending}
        />
        <Button
          type="submit"
          disabled={!inputValue.trim() || isStreaming || isSending}
        >
          {isStreaming || isSending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
