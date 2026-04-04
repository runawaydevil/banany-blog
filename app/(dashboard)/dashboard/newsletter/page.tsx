import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveThemeForSite, resolveTypographyForSite } from "@/lib/site";
import { mediaUrlById } from "@/lib/media";
import { fontStackForKey } from "@/lib/fonts-registry";
import { NewsletterDashboard } from "@/components/newsletter-dashboard";

export default async function NewsletterPage() {
  const site = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!site) redirect("/setup");

  const [subscribers, campaigns, logoUrl] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: [{ unsubscribedAt: "asc" }, { createdAt: "desc" }],
    }),
    prisma.newsletterCampaign.findMany({
      orderBy: { sentAt: "desc" },
      take: 20,
    }),
    mediaUrlById(site.logoMediaId),
  ]);

  const tokens = resolveThemeForSite(site);
  const typography = resolveTypographyForSite(site);

  return (
    <NewsletterDashboard
      siteTitle={site.siteTitle}
      locale={site.locale}
      logoUrl={logoUrl}
      tokens={tokens}
      bodyFontStack={fontStackForKey(typography.body)}
      headingFontStack={fontStackForKey(typography.heading)}
      subscribers={subscribers.map((subscriber) => ({
        id: subscriber.id,
        email: subscriber.email,
        createdAt: subscriber.createdAt.toISOString(),
        unsubscribedAt: subscriber.unsubscribedAt?.toISOString() ?? null,
      }))}
      campaigns={campaigns.map((campaign) => ({
        id: campaign.id,
        subject: campaign.subject,
        previewText: campaign.previewText,
        kind: campaign.kind,
        status: campaign.status,
        recipientCount: campaign.recipientCount,
        failureCount: campaign.failureCount,
        sentAt: campaign.sentAt.toISOString(),
      }))}
    />
  );
}
