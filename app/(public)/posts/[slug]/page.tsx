import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { toValidDate, toISOStringSafe } from "@/lib/dates";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { NewsletterInline } from "@/components/newsletter-inline";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) return { title: "Not found" };
  const site = await getSiteSettings();
  const base = getEffectivePublicOrigin(site).replace(/\/$/, "");
  const pageTitle = post.title?.trim() || "Post";
  return {
    title: pageTitle,
    description: post.excerpt?.trim() || undefined,
    openGraph: {
      title: pageTitle,
      url: `${base}/posts/${slug}`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  const site = await getSiteSettings();
  const date = toValidDate(post.publishedAt) ?? toValidDate(post.createdAt);
  const dateIso = toISOStringSafe(post.publishedAt) ?? toISOStringSafe(post.createdAt);
  const html = sanitizePostHtml(post.content);

  return (
    <article className="prose-bb">
      <Link
        href="/"
        className="text-xs text-[var(--bb-text-muted)] hover:text-[var(--bb-link)]"
      >
        ← Home
      </Link>
      {post.title ? (
        <h1 className="mt-6 font-[family-name:var(--bb-font-heading)] text-3xl leading-tight text-[var(--bb-heading)]">
          {post.title}
        </h1>
      ) : (
        <p className="mt-6 text-sm text-[var(--bb-text-muted)]">Note</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--bb-text-muted)]">
        {date && dateIso ? (
          <time dateTime={dateIso}>
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        ) : null}
        <span>{post.type.toLowerCase()}</span>
        {post.tags.map((t) => (
          <span key={t} className="rounded bg-[var(--bb-surface-soft)] px-1.5 py-0.5">
            {t}
          </span>
        ))}
      </div>
      {post.type === "LINK" && post.linkUrl ? (
        <a
          href={post.linkUrl}
          className="mt-4 block text-[var(--bb-link)] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {post.linkUrl}
        </a>
      ) : null}
      <div
        className="post-body mt-8 space-y-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {site?.newsletterEnabledPost ? (
        <div className="mt-12 border-t border-[var(--bb-border)] pt-6">
          <NewsletterInline locale={site.locale} />
        </div>
      ) : null}
    </article>
  );
}
