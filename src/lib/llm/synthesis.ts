import { openai } from "../openai";
import { Memory } from "../types";

const SYSTEM_PROMPT = `
You are a memory synthesis engine. Your task is to analyze a list of raw memory fragments (user preferences, facts, details) and synthesize them into exactly 10 distinct, concise core memory statements.

Rules:
1. Deduplicate conflicting or redundant information.
2. Prioritize recent information if there are conflicts.
3. Ensure the set covers diverse topics (identity, preferences, important facts).
4. Output must be a valid JSON object with a single key "memories" containing an array of strings.
5. Each string should be a clear, standalone statement about the user (e.g., "User is allergic to peanuts").
6. Do not include any explanations or markdown formatting, just the JSON object.
`;

export async function synthesizeCoreMemories(
  memories: Memory[]
): Promise<string[]> {
  if (memories.length === 0) {
    return [];
  }

  const memoryContent = memories
    .map((m) => `- [${m.metadata.timestamp}]: ${m.content}`)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here are the raw memory fragments:\n\n${memoryContent}\n\nSynthesize these into 10 core memories.`,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from LLM");
    }

    const parsed = JSON.parse(content);

    if (parsed.memories && Array.isArray(parsed.memories)) {
      return parsed.memories.slice(0, 10);
    }

    return [];
  } catch (error) {
    console.error("Error synthesizing core memories:", error);
    return [];
  }
}
