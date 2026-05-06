import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toISOStringSafe, toValidDate } from "@/lib/dates";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { NewsletterInline } from "@/components/newsletter-inline";
import { PostContent } from "@/components/post-content";
import { finalizeContentExcerptForStorage } from "@/lib/excerpt-plain";
import { intlLocale, normalizeLocale, t } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getSiteSettings();
  const locale = normalizeLocale(site?.locale);
  const post = await prisma.post.findUnique({ where: { slug } });
  const tr = post?.groupId
    ? await prisma.postTranslation.findFirst({
        where: { groupId: post.groupId, locale, published: true },
      })
    : null;
  const entity = tr ?? post;

  if (!entity || !entity.published) {
    return { title: t(site?.locale, "common.notFound") };
  }

  const base = getEffectivePublicOrigin(site).replace(/\/$/, "");
  const pageTitle = entity.title?.trim() || t(site?.locale, "post.note");
  return {
    title: pageTitle,
    description:
      finalizeContentExcerptForStorage(entity.content, entity.contentFormat) ||
      undefined,
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
  const site = await getSiteSettings();
  const locale = normalizeLocale(site?.locale);
  const post = await prisma.post.findUnique({ where: { slug } });
  const tr = post?.groupId
    ? await prisma.postTranslation.findFirst({
        where: { groupId: post.groupId, locale, published: true },
      })
    : null;
  const entity = tr ?? post;
  if (!entity || !entity.published) notFound();

  const date =
    toValidDate(entity.publishedAt) ?? toValidDate(entity.createdAt);
  const dateIso =
    toISOStringSafe(entity.publishedAt) ?? toISOStringSafe(entity.createdAt);

  return (
    <article className="prose-bb">
      <Link
        href="/"
        className="text-xs text-[var(--bb-text-muted)] hover:text-[var(--bb-link)]"
      >
        {t(locale, "common.backHome")}
      </Link>
      {entity.title ? (
        <h1 className="mt-6 font-[family-name:var(--bb-font-heading)] text-3xl leading-tight text-[var(--bb-heading)]">
          {entity.title}
        </h1>
      ) : (
        <p className="mt-6 text-sm text-[var(--bb-text-muted)]">
          {t(locale, "post.note")}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--bb-text-muted)]">
        {date && dateIso ? (
          <time dateTime={dateIso}>
            {date.toLocaleDateString(intlLocale(locale), {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        ) : null}
        <span>{t(locale, `postType.${entity.type.toLowerCase()}`)}</span>
        {entity.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-[var(--bb-surface-soft)] px-1.5 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
      {entity.type === "LINK" && entity.linkUrl ? (
        <a
          href={entity.linkUrl}
          className="mt-4 block text-[var(--bb-link)] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {entity.linkUrl}
        </a>
      ) : null}
      <PostContent
        content={entity.content}
        contentFormat={entity.contentFormat}
        className="post-body mt-8"
      />
      {site?.newsletterEnabledPost ? (
        <div className="mt-12 border-t border-[var(--bb-border)] pt-6">
          <NewsletterInline locale={site.locale} />
        </div>
      ) : null}
    </article>
  );
}
