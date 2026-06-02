import type { FeedItem } from "@/types/feed";

// Client-side persistence for imported items (no backend / no API cost).
// Stored per source in localStorage so a page reload keeps them.

const KEY = "dashboard.importedItems.v1";

export function loadImportedItems(): FeedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedItem[]) : [];
  } catch {
    return [];
  }
}

// Merge new items with existing ones, de-duplicating by id.
export function saveImportedItems(items: FeedItem[]): FeedItem[] {
  const existing = loadImportedItems();
  const byId = new Map<string, FeedItem>();
  for (const item of [...existing, ...items]) byId.set(item.id, item);
  const merged = [...byId.values()];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
  }
  return merged;
}

export function clearImportedItems(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
