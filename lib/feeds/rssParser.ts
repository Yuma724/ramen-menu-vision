// Minimal, dependency-free RSS 2.0 / Atom parser.
// Good enough for typical publication feeds (Substack, WordPress, etc.).
// Not a full XML parser — intentionally lightweight to avoid extra deps.

export interface ParsedFeedItem {
  title: string;
  link?: string;
  description?: string;
  author?: string;
  published?: string; // ISO 8601 when parseable, otherwise raw string
  thumbnail?: string;
}

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&");
}

function stripHtml(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function firstTag(block: string, tag: string): string | undefined {
  // Matches <tag ...>value</tag> (handles attributes on the opening tag).
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1] : undefined;
}

function attrLink(block: string): string | undefined {
  // Atom-style <link href="..." /> — prefer rel="alternate" or no rel.
  const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)];
  let fallback: string | undefined;
  for (const l of links) {
    const attrs = l[1];
    const href = attrs.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const rel = attrs.match(/rel=["']([^"']+)["']/i)?.[1];
    if (!rel || rel === "alternate") return href;
    fallback = fallback ?? href;
  }
  return fallback;
}

function findThumbnail(block: string): string | undefined {
  const mediaThumb = block.match(
    /<media:(?:thumbnail|content)\b[^>]*url=["']([^"']+)["']/i
  )?.[1];
  if (mediaThumb) return mediaThumb;
  const enclosure = block.match(
    /<enclosure\b[^>]*url=["']([^"']+)["'][^>]*type=["']image/i
  )?.[1];
  if (enclosure) return enclosure;
  // First <img> inside content/description.
  const content =
    firstTag(block, "content:encoded") ??
    firstTag(block, "description") ??
    firstTag(block, "content") ??
    "";
  const img = decodeEntities(content).match(/<img\b[^>]*src=["']([^"']+)["']/i)?.[1];
  return img;
}

function toIso(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim();
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? cleaned : d.toISOString();
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];

  // RSS uses <item>, Atom uses <entry>.
  const blocks = [
    ...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi),
    ...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
  ];

  for (const match of blocks) {
    const block = match[0];

    const rawTitle = firstTag(block, "title") ?? "";
    const title = stripHtml(rawTitle) || "(no title)";

    const link =
      stripHtml(firstTag(block, "link") ?? "") || attrLink(block) || undefined;

    const rawSummary =
      firstTag(block, "description") ??
      firstTag(block, "summary") ??
      firstTag(block, "content:encoded") ??
      firstTag(block, "content") ??
      "";
    const summary = stripHtml(rawSummary).slice(0, 400) || undefined;

    const author =
      stripHtml(
        firstTag(block, "dc:creator") ??
          firstTag(firstTag(block, "author") ?? "", "name") ??
          firstTag(block, "author") ??
          ""
      ) || undefined;

    const published = toIso(
      firstTag(block, "pubDate") ??
        firstTag(block, "published") ??
        firstTag(block, "updated") ??
        firstTag(block, "dc:date")
    );

    items.push({
      title,
      link,
      description: summary,
      author,
      published,
      thumbnail: findThumbnail(block),
    });
  }

  return items;
}
