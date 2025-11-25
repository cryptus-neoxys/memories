"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

import type { Chat, Message } from "@/lib/types";

const STORAGE_KEY = "bhindi-chat-store";
const MAX_TITLE_LENGTH = 48;
const DEFAULT_CHAT_TITLE = "New Chat";

const fallbackStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const storage = createJSONStorage(() =>
  typeof window === "undefined" ? fallbackStorage : window.localStorage
);

const buildChat = (title = DEFAULT_CHAT_TITLE): Chat => ({
  id: nanoid(),
  title: title.trim() || DEFAULT_CHAT_TITLE,
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 0,
});

type ChatStore = {
  chats: Chat[];
  activeChatId: string | null;
  addChat: (chat?: Chat) => string;
  selectChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateChat: (chatId: string, updater: (chat: Chat) => Chat) => void;
  deleteChat: (chatId: string) => void;
  getChatById: (chatId: string) => Chat | undefined;
  resetStore: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      addChat: (chat) => {
        const newChat = chat ?? buildChat();
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
        }));
        return newChat.id;
      },
      selectChat: (chatId) => set(() => ({ activeChatId: chatId })),
      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id !== chatId) return chat;
            const updatedMessages = [...chat.messages, message];
            const derivedTitle =
              chat.title === DEFAULT_CHAT_TITLE && message.role === "user"
                ? message.content.slice(0, MAX_TITLE_LENGTH) ||
                  DEFAULT_CHAT_TITLE
                : chat.title;

            return {
              ...chat,
              messages: updatedMessages,
              updatedAt: message.timestamp,
              messageCount: chat.messageCount + 1,
              title: derivedTitle,
            };
          }),
        })),
      updateChat: (chatId, updater) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? updater({ ...chat }) : chat
          ),
        })),
      deleteChat: (chatId) =>
        set((state) => {
          const remainingChats = state.chats.filter(
            (chat) => chat.id !== chatId
          );
          const isActiveChat = state.activeChatId === chatId;

          return {
            chats: remainingChats,
            activeChatId: isActiveChat
              ? remainingChats[0]?.id ?? null
              : state.activeChatId,
          };
        }),
      getChatById: (chatId) => get().chats.find((chat) => chat.id === chatId),
      resetStore: () => set({ chats: [], activeChatId: null }),
    }),
    {
      name: STORAGE_KEY,
      storage,
    }
  )
);

export const createNewChat = (title?: string) => {
  const chat = buildChat(title);
  useChatStore.getState().addChat(chat);
  useChatStore.getState().selectChat(chat.id);
  return chat;
};

export const deleteChat = (chatId: string) => {
  useChatStore.getState().deleteChat(chatId);
};

export const getChatById = (chatId: string) =>
  useChatStore.getState().getChatById(chatId);
