import type { FeedItem } from "@/types/feed";
import { fetchWithTimeout, type FeedAdapter, type FetchResult } from "@/lib/feeds/adapter";

// Account to follow. Defaults to the one requested, overridable via env.
const HANDLE = (process.env.X_HANDLE || "aleabitoreddit").replace(/^@/, "");
const BEARER = process.env.X_BEARER_TOKEN;
const SOURCE_NAME = `X @${HANDLE}`;

const MOCK_ITEMS: FeedItem[] = [
  {
    id: "x-mock-1",
    sourceId: "x",
    sourceName: SOURCE_NAME,
    title: `(サンプル) @${HANDLE} の投稿はここに表示されます`,
    summary:
      "X_BEARER_TOKEN を設定すると X API v2 から実際の投稿を取得します。未設定のためモックを表示しています。",
    url: `https://x.com/${HANDLE}`,
    author: `@${HANDLE}`,
    publishedAt: new Date().toISOString(),
    isMock: true,
  },
];

interface XUserResponse {
  data?: { id: string; name: string; username: string };
}
interface XTweet {
  id: string;
  text: string;
  created_at?: string;
}
interface XTimelineResponse {
  data?: XTweet[];
}

export const xAdapter: FeedAdapter = {
  id: "x",
  name: SOURCE_NAME,
  async fetchItems(): Promise<FetchResult> {
    if (!BEARER) {
      // Not configured — return mock without throwing so the dashboard still loads.
      return { items: MOCK_ITEMS, live: false };
    }

    const authHeaders = { Authorization: `Bearer ${BEARER}` };

    // 1) Resolve username -> user id.
    const userRes = await fetchWithTimeout(
      `https://api.twitter.com/2/users/by/username/${encodeURIComponent(HANDLE)}`,
      { headers: authHeaders }
    );
    if (!userRes.ok) {
      throw new Error(`X users lookup responded ${userRes.status}`);
    }
    const user = (await userRes.json()) as XUserResponse;
    const userId = user.data?.id;
    if (!userId) throw new Error("X user id not found");

    // 2) Fetch recent tweets.
    const tweetsRes = await fetchWithTimeout(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=20&tweet.fields=created_at&exclude=replies`,
      { headers: authHeaders }
    );
    if (!tweetsRes.ok) {
      throw new Error(`X timeline responded ${tweetsRes.status}`);
    }
    const timeline = (await tweetsRes.json()) as XTimelineResponse;
    const tweets = timeline.data || [];

    const items: FeedItem[] = tweets.map((t) => {
      const text = t.text.replace(/\s+/g, " ").trim();
      return {
        id: `x-${t.id}`,
        sourceId: "x" as const,
        sourceName: SOURCE_NAME,
        title: text.length > 80 ? `${text.slice(0, 80)}…` : text || "(no text)",
        summary: text,
        url: `https://x.com/${HANDLE}/status/${t.id}`,
        author: `@${HANDLE}`,
        publishedAt: t.created_at || new Date().toISOString(),
      };
    });

    return { items, live: true };
  },
};

export const xMock = MOCK_ITEMS;
