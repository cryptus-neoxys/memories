import { openai } from "@/lib/openai";
import { NextResponse } from "next/server";
import { Message } from "@/lib/types";
import { getCoreMemories } from "@/lib/core-memory-service";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Fetch core memories
    let coreMemoriesContext = "";
    try {
      const { memories } = await getCoreMemories();
      if (memories.length > 0) {
        coreMemoriesContext = `\n\nCore Memories (User Facts & Preferences):\n${memories
          .map((m, i) => `${i + 1}. ${m}`)
          .join("\n")}`;
      }
    } catch (err) {
      console.error("Failed to fetch core memories for chat:", err);
    }

    // Inject into system prompt or add new system prompt
    const systemMessage = messages.find((m: Message) => m.role === "system");
    const apiMessages = messages.map((m: Message) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    if (systemMessage) {
      // If system message exists, append context (though usually system message is not passed from client in this simple app,
      // but if it were, we'd modify it. Here we assume client sends user/assistant messages).
      // Actually, standard practice is to prepend a system message if not present.
    } else {
      apiMessages.unshift({
        role: "system",
        content: `You are a helpful AI assistant.${coreMemoriesContext}`,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
