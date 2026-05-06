import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { toISOStringSafe } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { finalizeContentExcerptForStorage } from "@/lib/excerpt-plain";
import { normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const site = await getSiteSettings();
  if (!site?.setupComplete) {
    return new Response(t(site?.locale, "common.notFound"), { status: 404 });
  }

  const base = getEffectivePublicOrigin(site).replace(/\/$/, "");
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const locale = normalizeLocale(site.locale);
  const groupIds = posts.map((p) => p.groupId).filter(Boolean) as string[];
  const translations =
    groupIds.length > 0
      ? await prisma.postTranslation.findMany({
          where: { groupId: { in: groupIds }, locale, published: true },
          select: {
            groupId: true,
            slug: true,
            title: true,
            content: true,
            contentFormat: true,
            publishedAt: true,
            createdAt: true,
          },
        })
      : [];
  const byGroup = new Map(translations.map((tr) => [tr.groupId, tr]));

  const items = posts
    .map((p) => {
      const tr = p.groupId ? byGroup.get(p.groupId) : undefined;
      const slug = tr?.slug ?? p.slug;
      const titleRaw = tr?.title ?? p.title;
      const content = tr?.content ?? p.content;
      const contentFormat = tr?.contentFormat ?? p.contentFormat;
      const pub =
        toISOStringSafe(tr?.publishedAt ?? p.publishedAt) ??
        toISOStringSafe(tr?.createdAt ?? p.createdAt);

      const link = `${base}/posts/${slug}`;
      const title = escapeXml(titleRaw || t(site.locale, "post.note"));
      const derived = finalizeContentExcerptForStorage(content, contentFormat);
      const desc = escapeXml(
        (derived || "").slice(0, 500) || titleRaw || "",
      );
      return `
    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      ${pub ? `<pubDate>${new Date(pub).toUTCString()}</pubDate>` : ""}
      <description>${desc}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.siteTitle)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(site.seoDescription || site.siteTitle)}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
