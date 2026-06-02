"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseImport } from "@/lib/feeds/importParser";
import { saveImportedItems, clearImportedItems } from "@/lib/feeds/importStore";
import type { FeedItem } from "@/types/feed";

interface Props {
  // Called whenever the imported set changes, with the full merged list.
  onChange: (items: FeedItem[]) => void;
  importedCount: number;
}

export default function ImportPanel({ onChange, importedCount }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      setMessage(null);
      let added = 0;
      const allErrors: string[] = [];

      for (const file of files) {
        const text = await file.text();
        const { items, errors } = parseImport(file.name, text);
        if (items.length > 0) {
          const merged = saveImportedItems(items);
          onChange(merged);
          added += items.length;
        }
        if (errors.length) allErrors.push(`${file.name}: ${errors.join(", ")}`);
      }

      if (added > 0) setMessage(`${added} 件の投稿を取り込みました`);
      if (allErrors.length) setError(allErrors.join(" / "));
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".txt", ".ndjson"],
    },
  });

  const handleClear = () => {
    clearImportedItems();
    onChange([]);
    setMessage("取り込んだ投稿を削除しました");
    setError(null);
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-800/70">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          X 投稿の取り込み（API不要 / CSV・JSON）
        </h2>
        {importedCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-600 hover:underline dark:text-red-400"
          >
            取り込み済み {importedCount} 件をクリア
          </button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center text-sm transition ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
        }`}
      >
        <input {...getInputProps()} />
        <p className="font-medium text-gray-700 dark:text-gray-300">
          {isDragActive
            ? "ここにドロップ…"
            : "CSV / JSON をドラッグ＆ドロップ、またはクリックして選択"}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          TwExportly の CSV、gallery-dl の JSON、X API の生 JSON に対応
        </p>
      </div>

      {message && (
        <p className="mt-2 text-xs text-green-700 dark:text-green-400">{message}</p>
      )}
      {error && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{error}</p>
      )}
    </div>
  );
}
