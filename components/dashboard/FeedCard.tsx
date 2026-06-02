import type { FeedItem, FeedSourceId } from "@/types/feed";

const SOURCE_STYLES: Record<FeedSourceId, { badge: string; label: string }> = {
  x: { badge: "bg-black text-white", label: "X" },
  semianalysis: { badge: "bg-indigo-600 text-white", label: "SemiAnalysis" },
  "gmail-nakashima": { badge: "bg-red-600 text-white", label: "Gmail" },
};

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return d.toLocaleDateString("ja-JP");
}

export default function FeedCard({ item }: { item: FeedItem }) {
  const style = SOURCE_STYLES[item.sourceId];

  const card = (
    <article className="group h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
          {item.author || item.sourceName}
        </span>
        {item.isMock && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            サンプル
          </span>
        )}
        <span className="ml-auto whitespace-nowrap text-xs text-gray-400">
          {timeAgo(item.publishedAt)}
        </span>
      </div>

      <h3 className="mb-1 font-semibold leading-snug text-gray-900 group-hover:text-indigo-600 dark:text-white">
        {item.title}
      </h3>

      {item.summary && (
        <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
          {item.summary}
        </p>
      )}

      {item.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnailUrl}
          alt=""
          className="mt-3 max-h-44 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
    </article>
  );

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {card}
      </a>
    );
  }
  return card;
}
