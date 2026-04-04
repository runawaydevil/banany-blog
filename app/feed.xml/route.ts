import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { toISOStringSafe } from "@/lib/dates";
import { t } from "@/lib/i18n";

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

  const items = posts
    .map((p) => {
      const link = `${base}/posts/${p.slug}`;
      const pub = toISOStringSafe(p.publishedAt) ?? toISOStringSafe(p.createdAt);
      const title = escapeXml(p.title || t(site.locale, "post.note"));
      const desc = escapeXml(
        (p.excerpt || "").slice(0, 500) || p.title || "",
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
