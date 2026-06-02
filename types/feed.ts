// Types for the aggregated content dashboard.
// A single normalized item that can come from any source (X, RSS, Gmail, ...).

export type FeedSourceId = "x" | "semianalysis" | "gmail-nakashima";

export interface FeedItem {
  id: string;
  sourceId: FeedSourceId;
  sourceName: string;
  title: string;
  summary?: string;
  url?: string;
  author?: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl?: string;
  // True when this item is placeholder/mock data because the source is not
  // configured with real credentials yet.
  isMock?: boolean;
}

export interface SourceStatus {
  id: FeedSourceId;
  name: string;
  // Did the adapter run without throwing?
  ok: boolean;
  // True when the data is fetched from a real API/feed, false when it is mock.
  live: boolean;
  error?: string;
  itemCount: number;
}

export interface FeedResponse {
  items: FeedItem[];
  sources: SourceStatus[];
  fetchedAt: string;
}
