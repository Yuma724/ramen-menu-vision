import type { Dish, SharedMenu } from "@/types";

// In-memory storage for demo purposes
// In production, replace with a real database
const storage = new Map<string, SharedMenu>();

export function saveSharedMenu(dishes: Dish[]): SharedMenu {
  const slug = generateSlug();
  const menu: SharedMenu = {
    id: slug,
    slug,
    dishes,
    createdAt: new Date().toISOString(),
  };
  storage.set(slug, menu);
  return menu;
}

export function getSharedMenu(slug: string): SharedMenu | null {
  return storage.get(slug) || null;
}

function generateSlug(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < 12; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

