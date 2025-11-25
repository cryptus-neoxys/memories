"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/chat-store";
import type { Message } from "@/lib/types";
import { MessageBubble } from "@/components/message-bubble";

const MEMORY_TRIGGER_INTERVAL = 2;

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
  }, [activeChat?.messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputValue]);

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

    // Retrieve relevant memories
    console.log("Retrieving memories for query:", trimmed);
    let memoryMessages: Message[] = [];
    try {
      const retrieveResponse = await fetch("/api/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      if (retrieveResponse.ok) {
        const { memories }: { memories: string[] } =
          await retrieveResponse.json();
        memoryMessages = memories.map((content) => ({
          id: nanoid(),
          role: "system" as const,
          content,
          timestamp: new Date().toISOString(),
        }));
        console.log("Retrieved memories:", memories.length);
      } else {
        console.warn("Failed to retrieve memories");
      }
    } catch (error) {
      console.error("Error retrieving memories:", error);
    }

    // Augment messages with memories
    const augmentedMessages = [
      ...memoryMessages,
      ...(activeChat?.messages || []),
      userMessage,
    ];

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
          messages: augmentedMessages,
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

      // After assistant response complete, check for embedding
      const currentChats = useChatStore.getState().chats;
      const updatedChat = currentChats.find((c) => c.id === chatId);
      if (
        updatedChat &&
        updatedChat.messageCount % MEMORY_TRIGGER_INTERVAL === 0
      ) {
        console.log(
          "Triggering embedding for chat",
          chatId,
          "with message count",
          updatedChat.messageCount
        );
        const lastMessages = updatedChat.messages.slice(
          -MEMORY_TRIGGER_INTERVAL
        );
        fetch("/api/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, messages: lastMessages }),
        }).catch((error) => {
          console.error("Error embedding memories:", error);
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
    chats,
  ]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSend();
    }
    // Allow default behavior (new line) for Enter
  };

  const renderEmptyState = () => (
    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
      Start a conversation to teach Bhindi about your preferences.
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm overflow-hidden">
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
        className="flex-1 min-h-0 rounded-md border"
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
        <Textarea
          ref={textareaRef}
          placeholder="Share context, preferences, or tasks..."
          value={inputValue}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setInputValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={isStreaming || isSending}
          rows={1}
          className="resize-none min-h-9 max-h-20"
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
