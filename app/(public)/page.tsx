import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { NewsletterInline } from "@/components/newsletter-inline";
import { toValidDate, toISOStringSafe } from "@/lib/dates";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { intlLocale, t, tm } from "@/lib/i18n";
import type { Post } from "@prisma/client";

const PAGE_SIZE = 20;

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
  const locale = site?.locale;
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
            {t(locale, "post.pinned")}
          </h2>
          <ul className="space-y-8">
            {pinned.map((post) => (
              <PostRow key={post.id} post={post} locale={locale} omitYear />
            ))}
          </ul>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="space-y-4">
          <ul className="space-y-8 divide-y divide-[var(--bb-border)]/60">
            {rest.map((post) => (
              <li key={post.id} className="pt-8 first:pt-0 first:border-t-0">
                <PostRow post={post} locale={locale} omitYear />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {total === 0 ? (
        <p className="text-sm text-[var(--bb-text-muted)]">
          {t(locale, "post.empty")}
        </p>
      ) : null}

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bb-border)]/40 pt-8 text-sm"
          aria-label={t(locale, "common.pagination")}
        >
          <span className="text-[var(--bb-text-muted)]">
            {tm(locale, "post.pageOf", { page, total: totalPages })}
          </span>
          <div className="flex gap-4">
            {page > 1 ? (
              <Link
                href={page === 2 ? "/" : `/?page=${page - 1}`}
                className="text-[var(--bb-link)] hover:underline"
              >
                {t(locale, "common.previous")}
              </Link>
            ) : (
              <span className="text-[var(--bb-text-muted)] opacity-50">
                {t(locale, "common.previous")}
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/?page=${page + 1}`}
                className="text-[var(--bb-link)] hover:underline"
              >
                {t(locale, "common.next")}
              </Link>
            ) : (
              <span className="text-[var(--bb-text-muted)] opacity-50">
                {t(locale, "common.next")}
              </span>
            )}
          </div>
        </nav>
      ) : null}

      {page === 1 && site?.newsletterEnabledHome ? (
        <section className="border-t border-[var(--bb-border)]/40 pt-10">
          <p className="mb-3 text-xs text-[var(--bb-text-muted)]">
            {t(locale, "newsletter.label")}
          </p>
          <NewsletterInline locale={site.locale} />
        </section>
      ) : null}
    </div>
  );
}

function PostRow({
  post,
  locale,
  omitYear,
}: {
  post: Post;
  locale: string | null | undefined;
  omitYear?: boolean;
}) {
  const date = toValidDate(post.publishedAt) ?? toValidDate(post.createdAt);
  const dateIso =
    toISOStringSafe(post.publishedAt) ?? toISOStringSafe(post.createdAt);
  const dateStr = date
    ? date.toLocaleDateString(
        intlLocale(locale),
        omitYear
          ? { month: "short", day: "numeric" }
          : { year: "numeric", month: "short", day: "numeric" },
      )
    : null;
  const rawHtml = sanitizePostHtml(post.content);
  const showBody = hasRenderableBody(post.content);
  const postTypeKey = `postType.${post.type.toLowerCase()}`;

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
            {t(locale, postTypeKey)}
          </span>
        ) : null}
      </div>
      <h3 className="mt-1 font-[family-name:var(--bb-font-heading)] text-lg">
        <Link
          href={`/posts/${post.slug}`}
          className="text-[var(--bb-heading)] hover:text-[var(--bb-link)]"
        >
          {post.title || t(locale, "post.note")}
        </Link>
      </h3>
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
