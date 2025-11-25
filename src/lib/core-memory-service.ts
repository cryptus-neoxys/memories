import { getBroadCandidateMemories } from "./pinecone";
import { synthesizeCoreMemories } from "./llm/synthesis";

// Simple in-memory cache
// Note: This cache is per-instance and will be cleared on server restart/redeploy.
let cachedMemories: string[] | null = null;
let lastUpdated = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export interface CoreMemoriesResult {
  memories: string[];
  source: "cache" | "generated";
  timestamp: number;
}

export async function getCoreMemories(): Promise<CoreMemoriesResult> {
  const now = Date.now();

  // Check cache
  if (cachedMemories && now - lastUpdated < CACHE_TTL) {
    return {
      memories: cachedMemories,
      source: "cache",
      timestamp: lastUpdated,
    };
  }

  // Fetch and synthesize
  const rawMemories = await getBroadCandidateMemories();
  const coreMemories = await synthesizeCoreMemories(rawMemories);

  // Update cache
  cachedMemories = coreMemories;
  lastUpdated = now;

  return {
    memories: coreMemories,
    source: "generated",
    timestamp: lastUpdated,
  };
}
