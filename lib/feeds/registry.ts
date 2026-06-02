import type { FeedItem, FeedResponse, SourceStatus } from "@/types/feed";
import type { FeedAdapter } from "@/lib/feeds/adapter";
import { semianalysisAdapter, semianalysisMock } from "@/lib/feeds/adapters/semianalysis";
import { xAdapter, xMock } from "@/lib/feeds/adapters/x";
import { gmailNakashimaAdapter, gmailNakashimaMock } from "@/lib/feeds/adapters/gmailNakashima";

// Register all sources here. Adding a new source = add an adapter + mock.
const ADAPTERS: { adapter: FeedAdapter; mock: FeedItem[] }[] = [
  { adapter: xAdapter, mock: xMock },
  { adapter: semianalysisAdapter, mock: semianalysisMock },
  { adapter: gmailNakashimaAdapter, mock: gmailNakashimaMock },
];

export async function aggregateFeeds(): Promise<FeedResponse> {
  const results = await Promise.all(
    ADAPTERS.map(async ({ adapter, mock }) => {
      try {
        const { items, live } = await adapter.fetchItems();
        const status: SourceStatus = {
          id: adapter.id,
          name: adapter.name,
          ok: true,
          live,
          itemCount: items.length,
        };
        return { items, status };
      } catch (err) {
        // On failure, fall back to mock items so the dashboard still renders.
        const status: SourceStatus = {
          id: adapter.id,
          name: adapter.name,
          ok: false,
          live: false,
          error: err instanceof Error ? err.message : "Unknown error",
          itemCount: mock.length,
        };
        return { items: mock, status };
      }
    })
  );

  const items = results
    .flatMap((r) => r.items)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return {
    items,
    sources: results.map((r) => r.status),
    fetchedAt: new Date().toISOString(),
  };
}
