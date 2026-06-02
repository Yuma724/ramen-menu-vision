"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FeedCard from "@/components/dashboard/FeedCard";
import SourceBar from "@/components/dashboard/SourceBar";
import ImportPanel from "@/components/dashboard/ImportPanel";
import { loadImportedItems } from "@/lib/feeds/importStore";
import type { FeedItem, FeedResponse, FeedSourceId, SourceStatus } from "@/types/feed";

export default function DashboardPage() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [imported, setImported] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<FeedSourceId | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feed", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setData((await res.json()) as FeedResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    setImported(loadImportedItems());
  }, [load]);

  // Merge server feed with locally-imported items.
  // Imported items take precedence: drop a source's mock placeholder once
  // real imported items exist for that source. De-duplicate by id.
  const { items, sources } = useMemo(() => {
    const serverItems = data?.items ?? [];
    const importedSourceIds = new Set(imported.map((i) => i.sourceId));

    const byId = new Map<string, FeedItem>();
    for (const it of imported) byId.set(it.id, it);
    for (const it of serverItems) {
      if (it.isMock && importedSourceIds.has(it.sourceId)) continue;
      if (!byId.has(it.id)) byId.set(it.id, it);
    }

    const merged = [...byId.values()].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Recompute per-source counts and mark imported sources as "live".
    const baseSources = data?.sources ?? [];
    const sourceList: SourceStatus[] = baseSources.map((s) => {
      const count = merged.filter((m) => m.sourceId === s.id).length;
      const hasImport = importedSourceIds.has(s.id);
      return {
        ...s,
        itemCount: count,
        live: s.live || hasImport,
        ok: s.ok || hasImport,
      };
    });

    return { items: merged, sources: sourceList };
  }, [data, imported]);

  const visibleItems = useMemo(
    () =>
      active === "all" ? items : items.filter((i) => i.sourceId === active),
    [items, active]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              📡 Content Dashboard
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              X・SemiAnalysis・Gmail メルマガを一つの画面で
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "更新中…" : "↻ 更新"}
          </button>
        </header>

        <ImportPanel onChange={setImported} importedCount={imported.length} />

        {data && (
          <SourceBar sources={sources} active={active} onChange={setActive} />
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-800/60"
              />
            ))}
          </div>
        )}

        {!loading && data && visibleItems.length === 0 && (
          <p className="py-16 text-center text-gray-500">
            表示できる項目がありません。
          </p>
        )}

        {visibleItems.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {data && (
          <p className="mt-8 text-center text-xs text-gray-400">
            最終更新: {new Date(data.fetchedAt).toLocaleString("ja-JP")}
          </p>
        )}
      </div>
    </main>
  );
}
