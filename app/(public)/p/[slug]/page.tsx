import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { getSiteSettings } from "@/lib/site";
import { t } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, site] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);
  if (!page || !page.published) return { title: t(site?.locale, "common.notFound") };
  return { title: page.title };
}

export default async function PublicPagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, site] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);
  if (!page || !page.published) notFound();

  const html = sanitizePostHtml(page.content);

  return (
    <article className="prose-bb">
      <Link
        href="/"
        className="text-xs text-[var(--bb-text-muted)] hover:text-[var(--bb-link)]"
      >
        {t(site?.locale, "common.backHome")}
      </Link>
      <h1 className="mt-6 font-[family-name:var(--bb-font-heading)] text-3xl text-[var(--bb-heading)]">
        {page.title}
      </h1>
      <div
        className="post-body mt-8 space-y-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
