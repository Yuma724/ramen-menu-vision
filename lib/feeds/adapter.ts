import type { FeedItem, FeedSourceId } from "@/types/feed";

export interface FetchResult {
  items: FeedItem[];
  // True when items came from a real API/feed, false when mock fallback.
  live: boolean;
}

export interface FeedAdapter {
  id: FeedSourceId;
  name: string;
  fetchItems(): Promise<FetchResult>;
}

// Fetch with a timeout so a slow/blocked source can't hang the whole dashboard.
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      // Cache feed responses for a few minutes at the edge.
      next: { revalidate: 300 },
    });
  } finally {
    clearTimeout(timer);
  }
}
