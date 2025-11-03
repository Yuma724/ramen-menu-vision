import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateImage(prompt: string): Promise<string> {
  const res = await openai.images.generate({
    model: "dall-e-2",
    prompt,
    size: "512x512",
  });

  // Be robust against undefined fields
  const datum = res?.data?.[0];
  const url = datum?.url;
  const b64 = datum?.b64_json;

  if (url) return url;
  if (typeof b64 === "string" && b64.length > 0) {
    return `data:image/png;base64,${b64}`;
  }
  throw new Error("No image generated from OpenAI (no url/b64_json).");
}
