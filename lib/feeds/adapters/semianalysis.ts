import type { FeedItem } from "@/types/feed";
import { parseFeed } from "@/lib/feeds/rssParser";
import { fetchWithTimeout, type FeedAdapter, type FetchResult } from "@/lib/feeds/adapter";

// SemiAnalysis publishes an RSS feed. Allow overriding via env in case the
// feed URL changes.
const FEED_URL =
  process.env.SEMIANALYSIS_FEED_URL || "https://www.semianalysis.com/feed";

const SOURCE_NAME = "SemiAnalysis";

const MOCK_ITEMS: FeedItem[] = [
  {
    id: "semianalysis-mock-1",
    sourceId: "semianalysis",
    sourceName: SOURCE_NAME,
    title: "(サンプル) SemiAnalysis の記事はここに表示されます",
    summary:
      "RSS 取得に失敗したためモックを表示しています。ネットワークが許可されていればデプロイ環境で自動的に実データへ切り替わります。",
    url: "https://www.semianalysis.com/",
    author: "SemiAnalysis",
    publishedAt: new Date().toISOString(),
    isMock: true,
  },
];

export const semianalysisAdapter: FeedAdapter = {
  id: "semianalysis",
  name: SOURCE_NAME,
  async fetchItems(): Promise<FetchResult> {
    const res = await fetchWithTimeout(FEED_URL, {
      headers: {
        // Browser-like UA — some CDNs (Cloudflare) reject bot-looking requests.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) {
      throw new Error(`SemiAnalysis feed responded ${res.status}`);
    }
    const xml = await res.text();
    const parsed = parseFeed(xml);
    if (parsed.length === 0) {
      throw new Error("SemiAnalysis feed parsed to 0 items");
    }

    const items: FeedItem[] = parsed.slice(0, 20).map((p, i) => ({
      id: `semianalysis-${p.link || i}`,
      sourceId: "semianalysis",
      sourceName: SOURCE_NAME,
      title: p.title,
      summary: p.description,
      url: p.link,
      author: p.author || SOURCE_NAME,
      publishedAt: p.published || new Date().toISOString(),
      thumbnailUrl: p.thumbnail,
    }));

    return { items, live: true };
  },
};

export const semianalysisMock = MOCK_ITEMS;
