export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface MemoryMetadata {
  messageRole: MessageRole;
  messageContent: string;
  timestamp: string;
  tokenCount: number;
  sourceMessageIds: string[];
  occurrenceCount: number;
}

export interface Memory {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  embedding: number[];
  score?: number;
}
