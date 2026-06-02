import type { FeedItem } from "@/types/feed";

// Parses exported X (Twitter) data into normalized FeedItems — no API needed.
// Supports:
//   - CSV exports (e.g. TwExportly): header-based column detection
//   - JSON arrays of arbitrary tweet objects (e.g. gallery-dl --dump-json)
//   - X API v2 raw JSON: { data: [ { id, text, created_at } ] }
//   - The app's own normalized JSON (array of FeedItem-like objects)

export interface ImportResult {
  items: FeedItem[];
  errors: string[];
}

// ── CSV tokenizer (RFC-4180-ish: handles quotes, escaped quotes, newlines) ──
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.length > 0)) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.length > 0)) rows.push(row);
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] ?? "";
    });
    return obj;
  });
}

// ── Field detection across the various export shapes ──
function pick(
  obj: Record<string, any>,
  patterns: RegExp[]
): string | undefined {
  const keys = Object.keys(obj);
  for (const pattern of patterns) {
    const key = keys.find((k) => pattern.test(k));
    if (key != null) {
      const val = obj[key];
      if (val != null && String(val).trim() !== "") return String(val).trim();
    }
  }
  return undefined;
}

const TEXT_KEYS = [/^full[_ ]?text$/i, /^text$/i, /^content$/i, /^tweet$/i, /body/i];
const ID_KEYS = [/^tweet[_ ]?id$/i, /^id[_ ]?str$/i, /^status[_ ]?id$/i, /^id$/i];
const DATE_KEYS = [/^created[_ ]?at$/i, /^date$/i, /timestamp/i, /time/i];
const URL_KEYS = [/permalink/i, /^url$/i, /link/i];
const AUTHOR_KEYS = [/screen[_ ]?name/i, /username/i, /handle/i, /^user$/i, /author/i];

function toIso(raw?: string): string {
  if (!raw) return new Date().toISOString();
  // Numeric epoch (seconds or ms)?
  if (/^\d{10,13}$/.test(raw)) {
    const n = Number(raw);
    return new Date(raw.length === 13 ? n : n * 1000).toISOString();
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function authorName(raw: string | undefined, fallbackHandle: string): string {
  if (!raw) return `@${fallbackHandle}`;
  // gallery-dl sometimes nests author as an object stringified; keep it simple.
  const cleaned = raw.replace(/^@/, "");
  return `@${cleaned}`;
}

function normalizeRecords(
  records: Record<string, any>[],
  handle: string
): FeedItem[] {
  const items: FeedItem[] = [];
  const seen = new Set<string>();

  records.forEach((rec, index) => {
    if (!rec || typeof rec !== "object") return;
    const text = pick(rec, TEXT_KEYS);
    if (!text) return; // skip rows without any text content

    const id = pick(rec, ID_KEYS) || `import-${index}`;
    if (seen.has(id)) return;
    seen.add(id);

    const handleFromRec = pick(rec, AUTHOR_KEYS)?.replace(/^@/, "") || handle;
    const url =
      pick(rec, URL_KEYS) ||
      (/^\d+$/.test(id)
        ? `https://x.com/${handleFromRec}/status/${id}`
        : `https://x.com/${handleFromRec}`);

    const clean = text.replace(/\s+/g, " ").trim();
    items.push({
      id: `x-import-${id}`,
      sourceId: "x",
      sourceName: `X @${handle}`,
      title: clean.length > 80 ? `${clean.slice(0, 80)}…` : clean,
      summary: clean,
      url,
      author: authorName(pick(rec, AUTHOR_KEYS), handleFromRec),
      publishedAt: toIso(pick(rec, DATE_KEYS)),
    });
  });

  return items;
}

export function parseImport(
  filename: string,
  content: string,
  handle = "aleabitoreddit"
): ImportResult {
  const errors: string[] = [];
  const trimmed = content.trim();
  if (!trimmed) return { items: [], errors: ["ファイルが空です"] };

  let records: Record<string, any>[] = [];

  const looksJson =
    /\.json$/i.test(filename) || trimmed.startsWith("{") || trimmed.startsWith("[");

  if (looksJson) {
    try {
      const data = JSON.parse(trimmed);
      if (Array.isArray(data)) {
        records = data;
      } else if (data && Array.isArray(data.data)) {
        records = data.data; // X API v2 shape
      } else if (data && Array.isArray(data.tweets)) {
        records = data.tweets;
      } else if (data && typeof data === "object") {
        records = [data];
      } else {
        errors.push("JSON の形式を認識できませんでした");
      }
    } catch (e) {
      // Maybe NDJSON (one JSON object per line — gallery-dl can emit this).
      const lines = trimmed.split("\n").filter((l) => l.trim());
      const parsed: Record<string, any>[] = [];
      let ok = true;
      for (const line of lines) {
        try {
          parsed.push(JSON.parse(line));
        } catch {
          ok = false;
          break;
        }
      }
      if (ok && parsed.length > 0) {
        records = parsed;
      } else {
        errors.push("JSON の解析に失敗しました");
      }
    }
  } else {
    records = parseCsv(trimmed);
    if (records.length === 0) {
      errors.push("CSV の解析に失敗しました（ヘッダー行を確認してください）");
    }
  }

  const items = normalizeRecords(records, handle);
  if (items.length === 0 && errors.length === 0) {
    errors.push("テキストを含む投稿が見つかりませんでした");
  }

  return { items, errors };
}
