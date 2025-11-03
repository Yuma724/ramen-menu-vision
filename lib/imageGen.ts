import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY || "",
});

export async function generateDishImage(prompt: string): Promise<string> {
  if (!process.env.IMAGE_API_KEY && !process.env.OPENAI_API_KEY) {
    throw new Error("IMAGE_API_KEY or OPENAI_API_KEY is not set");
  }

  try {
    // Note: DALL-E 3 only supports 1024x1024, but Next.js Image component
    // will automatically resize to 512x512 for display
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}, square format, 1:1 aspect ratio, professional food photography`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating dish image:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate dish image"
    );
  }
}

