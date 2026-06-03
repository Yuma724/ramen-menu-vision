import type { FeedItem } from "@/types/feed";
import { fetchWithTimeout, type FeedAdapter, type FetchResult } from "@/lib/feeds/adapter";
import { getGmailAccessToken } from "@/lib/feeds/gmailAuth";

// Satoshi Nakajima's (中島聡) weekly newsletter "週刊Life is beautiful",
// delivered to Gmail from まぐまぐプレミアム (mailmag@mag2premium.com).
// Uses the Gmail REST API; auth is resolved by lib/feeds/gmailAuth.ts
// (static access token, or client id/secret + refresh token).
//
// Required scope: https://www.googleapis.com/auth/gmail.readonly
//
// Default query targets the verified sender. Override GMAIL_NAKASHIMA_QUERY to
// narrow further, e.g. 'from:mailmag@mag2premium.com subject:"Life is beautiful"'.
const QUERY =
  process.env.GMAIL_NAKASHIMA_QUERY || "from:mailmag@mag2premium.com";

const SOURCE_NAME = "中島聡 メルマガ";

const MOCK_ITEMS: FeedItem[] = [
  {
    id: "gmail-nakashima-mock-1",
    sourceId: "gmail-nakashima",
    sourceName: SOURCE_NAME,
    title: "(サンプル) 週刊Life is beautiful はここに表示されます",
    summary:
      "Gmail の認証情報（gmail.readonly スコープ）を設定すると、Gmail からメルマガを取得します。未設定のためモックを表示しています。詳しくは GMAIL_SETUP.md を参照。",
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
    const accessToken = await getGmailAccessToken();
    if (!accessToken) {
      return { items: MOCK_ITEMS, live: false };
    }

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

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
