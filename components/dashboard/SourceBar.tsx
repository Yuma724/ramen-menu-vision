import type { FeedSourceId, SourceStatus } from "@/types/feed";

interface Props {
  sources: SourceStatus[];
  active: FeedSourceId | "all";
  onChange: (id: FeedSourceId | "all") => void;
}

export default function SourceBar({ sources, active, onChange }: Props) {
  const totalItems = sources.reduce((sum, s) => sum + s.itemCount, 0);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
          active === "all"
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
        }`}
      >
        すべて
        <span className="ml-1.5 opacity-60">{totalItems}</span>
      </button>

      {sources.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          title={
            s.live
              ? "実データを取得中"
              : s.error
                ? `エラー: ${s.error}（モック表示）`
                : "未設定のためモック表示"
          }
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            active === s.id
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              s.live ? "bg-green-500" : s.ok ? "bg-amber-400" : "bg-red-500"
            }`}
          />
          {s.name}
          <span className="opacity-60">{s.itemCount}</span>
        </button>
      ))}
    </div>
  );
}
