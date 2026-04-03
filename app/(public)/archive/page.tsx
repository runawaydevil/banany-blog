import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toValidDate, getYearSafe } from "@/lib/dates";
import type { Post } from "@prisma/client";

export const metadata = {
  title: "Archive",
};

function bucket(posts: Post[]) {
  const byYear = new Map<number, Post[]>();
  for (const p of posts) {
    const d = toValidDate(p.publishedAt) ?? toValidDate(p.createdAt);
    const y = getYearSafe(d);
    const key = y ?? -1;
    if (!byYear.has(key)) byYear.set(key, []);
    byYear.get(key)!.push(p);
  }
  return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
}

export default async function ArchivePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const buckets = bucket(posts);

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        Archive
      </h1>
      {buckets.map(([year, list]) => (
        <section key={year} className="space-y-3">
          <h2 className="border-b border-[var(--bb-border)] pb-1 text-sm font-medium text-[var(--bb-text-muted)]">
            {year === -1 ? "Undated" : year}
          </h2>
          <ul className="space-y-2">
            {list.map((p) => {
              const d = toValidDate(p.publishedAt) ?? toValidDate(p.createdAt);
              const label = d
                ? d.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "—";
              return (
                <li key={p.id} className="flex gap-3 text-sm">
                  <span className="w-14 shrink-0 text-[var(--bb-text-muted)] tabular-nums">
                    {label}
                  </span>
                  <Link
                    href={`/posts/${p.slug}`}
                    className="text-[var(--bb-link)] hover:text-[var(--bb-link-hover)] hover:underline"
                  >
                    {p.title || "Untitled note"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {posts.length === 0 ? (
        <p className="text-sm text-[var(--bb-text-muted)]">Nothing published yet.</p>
      ) : null}
    </div>
  );
}
