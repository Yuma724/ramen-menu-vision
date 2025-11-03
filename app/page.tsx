"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import DishGrid from "@/components/DishGrid";
import type { Dish } from "@/types";

export default function Home() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setDishes([]);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(file);

      // Parse menu with LLM via API
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image: base64 }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || "Failed to parse menu");
      }

      const { dishes: parsedDishes } = await parseResponse.json();

      // Generate images for each dish via API
      const dishesWithImages = await Promise.all(
        parsedDishes.map(async (dish: Dish) => {
          try {
            const imageResponse = await fetch("/api/generate-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ prompt: dish.imagePrompt }),
            });

            if (!imageResponse.ok) {
              const errorData = await imageResponse.json();
              throw new Error(errorData.error || "Failed to generate image");
            }

            const { imageUrl } = await imageResponse.json();
            return { ...dish, imageUrl };
          } catch (err) {
            console.error(`Failed to generate image for ${dish.nameEN}:`, err);
            return dish; // Return dish without image on error
          }
        })
      );

      setDishes(dishesWithImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">
            🍜 Ramen Menu Vision
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload a menu image and generate AI-powered dish previews
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!loading && dishes.length === 0 && (
            <ImageUpload onUpload={handleImageUpload} error={error} />
          )}

          {loading && <DishGrid.Skeleton />}

          {!loading && dishes.length > 0 && (
            <DishGrid dishes={dishes} />
          )}
        </div>
      </div>
    </main>
  );
}

