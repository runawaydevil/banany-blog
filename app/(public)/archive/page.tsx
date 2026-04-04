import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getYearSafe, toValidDate } from "@/lib/dates";
import { intlLocale, t } from "@/lib/i18n";
import type { Post } from "@prisma/client";

export async function generateMetadata() {
  const site = await getSiteSettings();
  return {
    title: t(site?.locale, "nav.archive"),
  };
}

function bucket(posts: Post[]) {
  const byYear = new Map<number, Post[]>();
  for (const post of posts) {
    const date = toValidDate(post.publishedAt) ?? toValidDate(post.createdAt);
    const year = getYearSafe(date);
    const key = year ?? -1;
    if (!byYear.has(key)) byYear.set(key, []);
    byYear.get(key)!.push(post);
  }
  return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
}

export default async function ArchivePage() {
  const [site, posts] = await Promise.all([
    getSiteSettings(),
    prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const locale = site?.locale;
  const buckets = bucket(posts);

  return (
    <div className="space-y-10">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        {t(locale, "nav.archive")}
      </h1>
      {buckets.map(([year, list]) => (
        <section key={year} className="space-y-3">
          <h2 className="border-b border-[var(--bb-border)] pb-1 text-sm font-medium text-[var(--bb-text-muted)]">
            {year === -1 ? t(locale, "archive.undated") : year}
          </h2>
          <ul className="space-y-2">
            {list.map((post) => {
              const date =
                toValidDate(post.publishedAt) ?? toValidDate(post.createdAt);
              const label = date
                ? date.toLocaleDateString(intlLocale(locale), {
                    month: "short",
                    day: "numeric",
                  })
                : "—";
              return (
                <li key={post.id} className="flex gap-3 text-sm">
                  <span className="w-14 shrink-0 text-[var(--bb-text-muted)] tabular-nums">
                    {label}
                  </span>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-[var(--bb-link)] hover:text-[var(--bb-link-hover)] hover:underline"
                  >
                    {post.title || t(locale, "post.untitledNote")}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {posts.length === 0 ? (
        <p className="text-sm text-[var(--bb-text-muted)]">
          {t(locale, "archive.empty")}
        </p>
      ) : null}
    </div>
  );
}
