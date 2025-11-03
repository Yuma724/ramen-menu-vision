import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/imageGen";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    const imageUrl = await generateImage(prompt);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate image",
      },
      { status: 500 }
    );
  }
}

