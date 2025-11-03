import { NextRequest, NextResponse } from "next/server";
import { parseMenuImage } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { base64Image } = await request.json();

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const dishes = await parseMenuImage(base64Image);

    return NextResponse.json({ dishes });
  } catch (error) {
    console.error("Error parsing menu:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse menu",
      },
      { status: 500 }
    );
  }
}

