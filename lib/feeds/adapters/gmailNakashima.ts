import type { FeedItem } from "@/types/feed";
import { fetchWithTimeout, type FeedAdapter, type FetchResult } from "@/lib/feeds/adapter";

// Satoshi Nakashima's newsletter ("週刊 Life is beautiful" etc.) delivered to Gmail.
// Uses the Gmail REST API with an OAuth access token supplied via env.
//
// Required scope: https://www.googleapis.com/auth/gmail.readonly
// Provide a (refreshed) access token in GMAIL_ACCESS_TOKEN.
const ACCESS_TOKEN = process.env.GMAIL_ACCESS_TOKEN;
// Gmail search query selecting the newsletter. Override to match your inbox.
const QUERY =
  process.env.GMAIL_NAKASHIMA_QUERY ||
  'subject:("Life is beautiful") OR from:(nakajima) OR "中島聡"';

const SOURCE_NAME = "さとしなかしま メルマガ";

const MOCK_ITEMS: FeedItem[] = [
  {
    id: "gmail-nakashima-mock-1",
    sourceId: "gmail-nakashima",
    sourceName: SOURCE_NAME,
    title: "(サンプル) Gmail のメルマガはここに表示されます",
    summary:
      "GMAIL_ACCESS_TOKEN（gmail.readonly スコープ）を設定すると、Gmail からメルマガを取得します。未設定のためモックを表示しています。",
    author: "中島聡",
    publishedAt: new Date().toISOString(),
    isMock: true,
  },
];

interface GmailListResponse {
  messages?: { id: string; threadId: string }[];
}
interface GmailHeader {
  name: string;
  value: string;
}
interface GmailMessage {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: GmailHeader[] };
}

function header(headers: GmailHeader[] | undefined, name: string): string | undefined {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}

export const gmailNakashimaAdapter: FeedAdapter = {
  id: "gmail-nakashima",
  name: SOURCE_NAME,
  async fetchItems(): Promise<FetchResult> {
    if (!ACCESS_TOKEN) {
      return { items: MOCK_ITEMS, live: false };
    }

    const authHeaders = { Authorization: `Bearer ${ACCESS_TOKEN}` };

    const listRes = await fetchWithTimeout(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(
        QUERY
      )}`,
      { headers: authHeaders }
    );
    if (!listRes.ok) {
      throw new Error(`Gmail list responded ${listRes.status}`);
    }
    const list = (await listRes.json()) as GmailListResponse;
    const ids = (list.messages || []).map((m) => m.id);

    const messages = await Promise.all(
      ids.map(async (id) => {
        const res = await fetchWithTimeout(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: authHeaders }
        );
        if (!res.ok) return null;
        return (await res.json()) as GmailMessage;
      })
    );

    const items: FeedItem[] = messages
      .filter((m): m is GmailMessage => m !== null)
      .map((m) => {
        const subject = header(m.payload?.headers, "Subject") || "(件名なし)";
        const from = header(m.payload?.headers, "From");
        const dateHeader = header(m.payload?.headers, "Date");
        const publishedAt = m.internalDate
          ? new Date(Number(m.internalDate)).toISOString()
          : dateHeader
            ? new Date(dateHeader).toISOString()
            : new Date().toISOString();
        return {
          id: `gmail-${m.id}`,
          sourceId: "gmail-nakashima" as const,
          sourceName: SOURCE_NAME,
          title: subject,
          summary: m.snippet,
          url: `https://mail.google.com/mail/u/0/#inbox/${m.id}`,
          author: from,
          publishedAt,
        };
      });

    return { items, live: true };
  },
};

export const gmailNakashimaMock = MOCK_ITEMS;
