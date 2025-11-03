import OpenAI from "openai";
import type { Dish } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function parseMenuImage(base64Image: string): Promise<Dish[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that parses restaurant menu images.
Extract dish information from the menu image. For each dish, provide:
1. Japanese name (nameJP)
2. English name (nameEN)
3. Short Japanese description (descriptionJP, optional)
4. Short English description (descriptionEN, optional)
5. A detailed image prompt for generating a 1:1 square image of this dish (imagePrompt)

Return a JSON object with a "dishes" array in this exact format:
{
  "dishes": [
    {
      "id": "unique-id-1",
      "nameJP": "醤油ラーメン",
      "nameEN": "Soy Sauce Ramen",
      "descriptionJP": "濃厚な鶏ガラスープと醤油の旨味",
      "descriptionEN": "Rich chicken broth with soy sauce umami",
      "imagePrompt": "A steaming bowl of soy sauce ramen with perfectly cooked noodles, a soft-boiled egg, chashu pork, green onions, and nori, photographed from above on a dark wooden table, professional food photography, shallow depth of field, warm lighting"
    }
  ]
}

Make sure each dish has a unique id. Generate descriptive, appetizing image prompts that would work well for DALL-E.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: "Please extract all dishes from this menu image and format them as described.",
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    const dishes = parsed.dishes || []; // Extract dishes array from response

    // Validate and ensure all required fields
    return dishes.map((dish: any, index: number) => ({
      id: dish.id || `dish-${index + 1}`,
      nameJP: dish.nameJP || dish.name || "Unknown",
      nameEN: dish.nameEN || dish.name || "Unknown",
      descriptionJP: dish.descriptionJP,
      descriptionEN: dish.descriptionEN,
      imagePrompt: dish.imagePrompt || `${dish.nameEN || dish.nameJP}, professional food photography, square format`,
    }));
  } catch (error) {
    console.error("Error parsing menu image:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to parse menu image"
    );
  }
}

