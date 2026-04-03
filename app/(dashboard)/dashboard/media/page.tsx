"use client";

import { useEffect, useState } from "react";

type M = {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export default function MediaPage() {
  const [items, setItems] = useState<M[]>([]);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        Media
      </h1>
      <p className="text-sm text-[var(--bb-text-muted)]">
        Upload from the post editor or Appearance. Click URL to copy.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <li
            key={m.id}
            className="overflow-hidden rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)]"
          >
            {m.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center text-xs text-[var(--bb-text-muted)]">
                {m.mimeType}
              </div>
            )}
            <button
              type="button"
              className="w-full truncate px-2 py-2 text-left text-xs text-[var(--bb-link)] hover:underline"
              onClick={() => navigator.clipboard.writeText(m.url)}
            >
              {m.url}
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--bb-text-muted)]">No uploads yet.</p>
      ) : null}
    </div>
  );
}
