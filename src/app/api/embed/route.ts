import { embedMemory } from "@/lib/memory-store";
import { NextResponse } from "next/server";
import { Message } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { chatId, messages }: { chatId: string; messages: Message[] } =
      await req.json();

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { chatId, messages }" },
        { status: 400 }
      );
    }

    // Run embedding asynchronously without blocking
    embedMemory(chatId, messages).catch((error) => {
      console.error("Error embedding memory:", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in embed route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
