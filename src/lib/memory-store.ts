import { openai } from "./openai";
import { index } from "./pinecone";
import { nanoid } from "nanoid";
import { Message, MemoryMetadata, Memory } from "./types";

const NAMESPACE = "poc-user";
const MAX_TOKENS_PER_CHUNK = 500;
const EMBEDDING_MODEL = "text-embedding-3-small";
const TOKENS_PER_WORD = 1.3;
const MAX_EMBEDDING_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const SIMILARITY_THRESHOLD = 0.35;
const MAX_MEMORY_RESULTS = 15;

// Approximate token count: roughly TOKENS_PER_WORD tokens per word
function countTokens(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words * TOKENS_PER_WORD);
}

export async function embedMemory(
  chatId: string,
  messages: Message[]
): Promise<void> {
  const userMessages = messages.filter((msg) => msg.role === "user");

  for (const message of userMessages) {
    const tokenCount = countTokens(message.content);

    if (tokenCount > MAX_TOKENS_PER_CHUNK) {
      console.warn(
        `Message ${message.id} exceeds token limit (${tokenCount} > ${MAX_TOKENS_PER_CHUNK}), skipping`
      );
      continue;
    }

    const memoryId = nanoid();

    let embedding: number[] | null = null;
    let attempts = 0;
    const maxAttempts = MAX_EMBEDDING_ATTEMPTS;

    while (attempts < maxAttempts) {
      try {
        const response = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: message.content,
          dimensions: 512,
        });
        embedding = response.data[0].embedding;
        break;
      } catch (error) {
        attempts++;
        console.error(
          `Embedding attempt ${attempts} failed for message ${message.id}:`,
          error
        );
        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to generate embedding after ${maxAttempts} attempts`
          );
        }
        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempts)
        );
      }
    }

    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    const metadata: MemoryMetadata = {
      messageRole: message.role,
      messageContent: message.content,
      timestamp: message.timestamp,
      tokenCount,
      sourceMessageIds: [message.id],
      occurrenceCount: 1,
    };

    attempts = 0;
    while (attempts < maxAttempts) {
      try {
        console.log(
          `Upserting memory ${memoryId} to Pinecone namespace ${NAMESPACE}`
        );
        await index.namespace(NAMESPACE).upsert([
          {
            id: memoryId,
            values: embedding,
            metadata: {
              message_role: metadata.messageRole,
              message_content: metadata.messageContent,
              timestamp: metadata.timestamp,
              token_count: metadata.tokenCount,
              source_message_ids: metadata.sourceMessageIds,
              occurrence_count: metadata.occurrenceCount,
            },
          },
        ]);
        break;
      } catch (error) {
        attempts++;
        console.error(
          `Upsert attempt ${attempts} failed for memory ${memoryId}:`,
          error
        );
        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to upsert memory after ${maxAttempts} attempts`
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempts)
        );
      }
    }
  }
}

export async function retrieveMemories(query: string): Promise<Memory[]> {
  let queryEmbedding: number[] | null = null;
  let attempts = 0;
  const maxAttempts = MAX_EMBEDDING_ATTEMPTS;

  while (attempts < maxAttempts) {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: query,
        dimensions: 512,
      });
      queryEmbedding = response.data[0].embedding;
      break;
    } catch (error) {
      attempts++;
      console.error(`Query embedding attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) {
        console.error(
          "Failed to generate query embedding, returning empty memories"
        );
        return [];
      }
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * attempts)
      );
    }
  }

  if (!queryEmbedding) {
    return [];
  }

  attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const queryResponse = await index.namespace(NAMESPACE).query({
        vector: queryEmbedding,
        topK: MAX_MEMORY_RESULTS,
        includeMetadata: true,
      });

      console.log(
        `[Pinecone] Query: "${query}" | Matches: ${queryResponse.matches?.length} | Top Score: ${queryResponse.matches?.[0]?.score}`
      );

      const memories: Memory[] =
        queryResponse.matches
          ?.filter((match) => match.score && match.score > SIMILARITY_THRESHOLD)
          .slice(0, MAX_MEMORY_RESULTS)
          .map((match) => ({
            id: match.id,
            content: (match.metadata?.message_content as string) || "",
            metadata: {
              messageRole:
                (match.metadata?.message_role as Message["role"]) || "user",
              messageContent: (match.metadata?.message_content as string) || "",
              timestamp: (match.metadata?.timestamp as string) || "",
              tokenCount: (match.metadata?.token_count as number) || 0,
              sourceMessageIds:
                (match.metadata?.source_message_ids as string[]) || [],
              occurrenceCount:
                (match.metadata?.occurrence_count as number) || 1,
            },
            embedding: match.values || [],
            score: match.score,
          })) || [];

      return memories;
    } catch (error) {
      attempts++;
      console.error(`Retrieval attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) {
        console.error("Failed to retrieve memories, returning empty array");
        return [];
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }
  }

  return [];
}

export function formatMemories(memories: Memory[]): string[] {
  return memories.map((memory) => {
    const date = new Date(memory.metadata.timestamp).toLocaleDateString();
    return `[From previous chat on ${date}]: ${memory.metadata.messageContent}`;
  });
}
