import { retrieveMemories } from "@/lib/memory-store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query }: { query: string } = await req.json();

    console.log(`[API] Searching memories for: "${query}"`);

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Expected { query }" },
        { status: 400 }
      );
    }

    const memories = await retrieveMemories(query);

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Error in memory search route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
