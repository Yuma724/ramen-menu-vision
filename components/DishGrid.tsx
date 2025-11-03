"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Dish } from "@/types";

interface DishGridProps {
  dishes: Dish[];
  showShareButton?: boolean;
}

export default function DishGrid({ dishes, showShareButton = true }: DishGridProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dishes }),
      });

      if (!response.ok) {
        throw new Error("Failed to share menu");
      }

      const data = await response.json();
      const url = `${window.location.origin}/share/${data.slug}`;
      setShareUrl(url);

      // Copy to clipboard
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error("Failed to share:", err);
    } finally {
      setSharing(false);
    }
  };

  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍜</div>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No dishes yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Upload a menu image to get started
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showShareButton && (
        <div className="mb-6 flex justify-center">
          {shareUrl ? (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-6 py-3 rounded-lg">
              <p className="font-medium mb-2">Link copied to clipboard!</p>
              <p className="text-sm break-all">{shareUrl}</p>
            </div>
          ) : (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {sharing ? "Sharing..." : "Share Menu"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
              {dish.imageUrl ? (
                <Image
                  src={dish.imageUrl}
                  alt={dish.nameEN || dish.nameJP}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl">🍜</div>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {dish.nameJP}
              </h3>
              <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {dish.nameEN}
              </h4>
              {dish.descriptionJP && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {dish.descriptionJP}
                </p>
              )}
              {dish.descriptionEN && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dish.descriptionEN}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

DishGrid.Skeleton = function DishGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

