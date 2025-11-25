import { NextResponse } from "next/server";
import { getCoreMemories } from "@/lib/core-memory-service";

export async function GET() {
  try {
    const result = await getCoreMemories();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in core memories API:", error);
    return NextResponse.json(
      { error: "Failed to generate core memories" },
      { status: 500 }
    );
  }
}
