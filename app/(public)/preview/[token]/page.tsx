import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { NewsletterInline } from "@/components/newsletter-inline";
import { PostContent } from "@/components/post-content";
import { toISOStringSafe, toValidDate } from "@/lib/dates";
import { intlLocale, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PreviewPostPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [post, site] = await Promise.all([
    prisma.post.findFirst({ where: { previewToken: token } }),
    getSiteSettings(),
  ]);
  if (!post) notFound();
  if (post.previewRevokedAt) notFound();

  const locale = site?.locale;
  const date = toValidDate(post.publishedAt) ?? toValidDate(post.createdAt);
  const dateIso =
    toISOStringSafe(post.publishedAt) ?? toISOStringSafe(post.createdAt);

  return (
    <article className="prose-bb">
      <Link
        href="/"
        className="text-xs text-[var(--bb-text-muted)] hover:text-[var(--bb-link)]"
      >
        {t(locale, "common.backHome")}
      </Link>
      <p className="mt-2 text-xs text-[var(--bb-text-muted)]">
        {t(locale, "preview.banner")}
      </p>
      {post.title ? (
        <h1 className="mt-6 font-[family-name:var(--bb-font-heading)] text-3xl leading-tight text-[var(--bb-heading)]">
          {post.title}
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
        <span className="opacity-70">{post.published ? t(locale, "preview.published") : t(locale, "preview.draft")}</span>
      </div>

      <PostContent content={post.content} contentFormat={post.contentFormat} />

      {site?.newsletterEnabledPost ? (
        <div className="mt-10">
          <NewsletterInline locale={site.locale} />
        </div>
      ) : null}
    </article>
  );
}

