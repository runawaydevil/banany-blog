import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { NewsletterInline } from "@/components/newsletter-inline";
import {
  toValidDate,
  getYearSafeInDefaultTz,
  toISOStringSafe,
} from "@/lib/dates";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import type { Post } from "@prisma/client";

const PAGE_SIZE = 20;

function groupByYear(posts: Post[]) {
  const map = new Map<number, Post[]>();
  for (const p of posts) {
    const d = toValidDate(p.publishedAt) ?? toValidDate(p.createdAt);
    const y = getYearSafeInDefaultTz(d) ?? 0;
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(p);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

function hasRenderableBody(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, "").trim();
  if (text.length > 0) return true;
  return /<(img|video|iframe|figure|hr)\b/i.test(html);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const total = await prisma.post.count({ where: { published: true } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRaw = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const page = Math.min(pageRaw, totalPages);

  const site = await getSiteSettings();
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [
      { pinned: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const pinned = posts.filter((p) => p.pinned);
  const rest = posts.filter((p) => !p.pinned);
  const grouped = groupByYear(rest);

  let customHome: { title: string; content: string } | null = null;
  if (page === 1 && site?.homePageSlug) {
    const pageRow = await prisma.page.findFirst({
      where: { slug: site.homePageSlug, published: true },
    });
    if (pageRow) {
      customHome = {
        title: pageRow.title,
        content: sanitizePostHtml(pageRow.content),
      };
    }
  }

  return (
    <div className="space-y-12">
      {page === 1 && site?.introSnippet ? (
        <p className="text-[var(--bb-text-muted)] leading-relaxed">
          {site.introSnippet}
        </p>
      ) : null}

      {page === 1 && customHome ? (
        <section className="prose-bb space-y-4">
          <h1 className="text-2xl font-semibold">{customHome.title}</h1>
          <div
            className="post-body space-y-3"
            dangerouslySetInnerHTML={{ __html: customHome.content }}
          />
        </section>
      ) : null}

      {pinned.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--bb-text-muted)]">
            Pinned
          </h2>
          <ul className="space-y-8">
            {pinned.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </ul>
        </section>
      ) : null}

      {grouped.map(([year, list]) => (
        <section key={year || "undated"} className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--bb-text-muted)]">
            {year === 0 ? "Undated" : year}
          </h2>
          <ul className="space-y-8 divide-y divide-[var(--bb-border)]/60">
            {list.map((p) => (
              <li key={p.id} className="pt-8 first:pt-0 first:border-t-0">
                <PostRow post={p} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {total === 0 ? (
        <p className="text-sm text-[var(--bb-text-muted)]">No posts yet.</p>
      ) : null}

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bb-border)]/40 pt-8 text-sm"
          aria-label="Pagination"
        >
          <span className="text-[var(--bb-text-muted)]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-4">
            {page > 1 ? (
              <Link
                href={page === 2 ? "/" : `/?page=${page - 1}`}
                className="text-[var(--bb-link)] hover:underline"
              >
                Previous
              </Link>
            ) : (
              <span className="text-[var(--bb-text-muted)] opacity-50">
                Previous
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/?page=${page + 1}`}
                className="text-[var(--bb-link)] hover:underline"
              >
                Next
              </Link>
            ) : (
              <span className="text-[var(--bb-text-muted)] opacity-50">
                Next
              </span>
            )}
          </div>
        </nav>
      ) : null}

      {page === 1 && site?.newsletterEnabledHome ? (
        <section className="border-t border-[var(--bb-border)]/40 pt-10">
          <p className="mb-3 text-xs text-[var(--bb-text-muted)]">
            Newsletter
          </p>
          <NewsletterInline locale={site.locale} />
        </section>
      ) : null}
    </div>
  );
}

function PostRow({ post }: { post: Post }) {
  const date = toValidDate(post.publishedAt) ?? toValidDate(post.createdAt);
  const dateIso =
    toISOStringSafe(post.publishedAt) ?? toISOStringSafe(post.createdAt);
  const dateStr = date
    ? date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const rawHtml = sanitizePostHtml(post.content);
  const showBody = hasRenderableBody(post.content);

  return (
    <article className="prose-bb max-w-none">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {dateStr && dateIso ? (
          <time
            dateTime={dateIso}
            className="text-xs text-[var(--bb-text-muted)] tabular-nums"
          >
            {dateStr}
          </time>
        ) : null}
        {post.type !== "POST" ? (
          <span className="text-xs text-[var(--bb-text-muted)] opacity-70">
            {post.type.toLowerCase()}
          </span>
        ) : null}
      </div>
      {post.title ? (
        <h3 className="mt-1 font-[family-name:var(--bb-font-heading)] text-lg">
          <Link
            href={`/posts/${post.slug}`}
            className="text-[var(--bb-heading)] hover:text-[var(--bb-link)]"
          >
            {post.title}
          </Link>
        </h3>
      ) : (
        <h3 className="mt-1 font-[family-name:var(--bb-font-heading)] text-lg">
          <Link
            href={`/posts/${post.slug}`}
            className="text-[var(--bb-heading)] hover:text-[var(--bb-link)]"
          >
            Note
          </Link>
        </h3>
      )}
      {post.type === "LINK" && post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-sm text-[var(--bb-link)] hover:underline"
        >
          {post.linkUrl}
        </a>
      ) : null}
      {showBody ? (
        <div
          className="post-body mt-4 space-y-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rawHtml }}
        />
      ) : null}
    </article>
  );
}
