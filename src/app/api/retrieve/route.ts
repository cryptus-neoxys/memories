import { retrieveMemories, formatMemories } from "@/lib/memory-store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query }: { query: string } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Expected { query }" },
        { status: 400 }
      );
    }

    const memories = await retrieveMemories(query);
    const formattedMemories = formatMemories(memories);

    return NextResponse.json({ memories: formattedMemories });
  } catch (error) {
    console.error("Error in retrieve route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
