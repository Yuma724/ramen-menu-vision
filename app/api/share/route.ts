import { NextRequest, NextResponse } from "next/server";
import { saveSharedMenu } from "@/lib/storage";
import type { Dish } from "@/types";
import { z } from "zod";

const shareSchema = z.object({
  dishes: z.array(
    z.object({
      id: z.string(),
      nameJP: z.string(),
      nameEN: z.string(),
      descriptionJP: z.string().optional(),
      descriptionEN: z.string().optional(),
      imagePrompt: z.string(),
      imageUrl: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = shareSchema.parse(body);

    const menu = saveSharedMenu(validated.dishes);

    return NextResponse.json({ slug: menu.slug, id: menu.id });
  } catch (error) {
    console.error("Error sharing menu:", error);
    return NextResponse.json(
      { error: "Failed to share menu" },
      { status: 400 }
    );
  }
}

