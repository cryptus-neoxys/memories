import { Pinecone } from "@pinecone-database/pinecone";
import { openai } from "./openai";
import { Memory } from "./types";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY environment variable is required");
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("PINECONE_INDEX_NAME environment variable is required");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

const EMBEDDING_MODEL = "text-embedding-3-small";
const NAMESPACE = "poc-user";

export async function getBroadCandidateMemories(
  query: string = "User preferences, facts, and important details",
  limit: number = 100
): Promise<Memory[]> {
  const embeddingResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
    dimensions: 512,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  const queryResponse = await index.namespace(NAMESPACE).query({
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true,
  });

  const memories: Memory[] =
    queryResponse.matches?.map((match: any) => ({
      id: match.id,
      content: (match.metadata?.message_content as string) || "",
      metadata: {
        messageRole: (match.metadata?.message_role as any) || "user",
        messageContent: (match.metadata?.message_content as string) || "",
        timestamp: (match.metadata?.timestamp as string) || "",
        tokenCount: (match.metadata?.token_count as number) || 0,
        sourceMessageIds:
          (match.metadata?.source_message_ids as string[]) || [],
        occurrenceCount: (match.metadata?.occurrence_count as number) || 1,
      },
      embedding: match.values || [],
      score: match.score,
    })) || [];

  const now = Date.now();
  const rankedMemories = memories.map((memory) => {
    const timeDiff = now - new Date(memory.metadata.timestamp).getTime();
    const daysDiff = Math.max(0, timeDiff / (1000 * 60 * 60 * 24));

    // Recency score: decay over time
    const recencyScore = 1 / (1 + daysDiff * 0.1);

    // Frequency score: log scale
    const frequencyScore = Math.log(memory.metadata.occurrenceCount + 1);

    // Similarity score
    const similarityScore = memory.score || 0;

    // Weighted combination
    // Weights: Similarity 0.4, Recency 0.4, Frequency 0.2
    const finalScore =
      similarityScore * 0.4 + recencyScore * 0.4 + frequencyScore * 0.2;

    return { ...memory, score: finalScore };
  });

  return rankedMemories.sort((a, b) => (b.score || 0) - (a.score || 0));
}

