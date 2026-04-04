import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMailgunEmail } from "@/lib/mailgun";
import { getMailgunConfigFromEnv } from "@/lib/mailgun-env";
import { absolutizeMediaUrl, mediaUrlById } from "@/lib/media";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { resolveThemeForSite, resolveTypographyForSite } from "@/lib/site";
import {
  hasRenderableNewsletterBody,
  newsletterHtmlToPlainText,
  renderNewsletterEmail,
  sanitizeNewsletterHtml,
} from "@/lib/newsletter";
import { fontStackForKey } from "@/lib/fonts-registry";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createCampaignSchema = z.object({
  subject: z.string().min(1).max(200),
  previewText: z.string().max(300).nullable().optional(),
  bodyHtml: z.string().max(120_000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.newsletterCampaign.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createCampaignSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const site = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const mailgun = getMailgunConfigFromEnv();
  if (!site || !mailgun) {
    return NextResponse.json(
      {
        error:
          "Newsletter sending is unavailable: Mailgun is not configured on the server.",
      },
      { status: 503 },
    );
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { createdAt: "asc" },
  });
  if (subscribers.length === 0) {
    return NextResponse.json(
      { error: "There are no active subscribers yet." },
      { status: 400 },
    );
  }

  const safeHtml = sanitizeNewsletterHtml(parsed.data.bodyHtml);
  if (!hasRenderableNewsletterBody(safeHtml)) {
    return NextResponse.json(
      { error: "Newsletter body is empty." },
      { status: 400 },
    );
  }

  const bodyText = newsletterHtmlToPlainText(safeHtml);
  const tokens = resolveThemeForSite(site);
  const typography = resolveTypographyForSite(site);
  const [logoUrlRaw] = await Promise.all([mediaUrlById(site.logoMediaId)]);
  const logoUrl = absolutizeMediaUrl(logoUrlRaw, site);
  const baseUrl = getEffectivePublicOrigin(site).replace(/\/$/, "");
  const bodyFontStack = fontStackForKey(typography.body);
  const headingFontStack = fontStackForKey(typography.heading);

  const results = await Promise.allSettled(
    subscribers.map(async (subscriber) => {
      const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(
        subscriber.unsubscribeToken,
      )}`;
      const html = renderNewsletterEmail({
        bodyHtml: safeHtml,
        bodyFontStack,
        headingFontStack,
        logoUrl,
        previewText: parsed.data.previewText ?? "",
        siteTitle: site.siteTitle,
        tokens,
        unsubscribeUrl,
      });
      const text = `${bodyText}\n\nUnsubscribe: ${unsubscribeUrl}`;

      return sendMailgunEmail({
        apiKey: mailgun.apiKey,
        domain: mailgun.domain,
        region: mailgun.region,
        from: mailgun.from,
        to: subscriber.email,
        subject: parsed.data.subject,
        text,
        html,
        replyTo: mailgun.replyTo,
      });
    }),
  );

  const delivered = results.filter(
    (result) => result.status === "fulfilled" && result.value.ok,
  ).length;
  const failures = results.length - delivered;

  if (delivered === 0) {
    return NextResponse.json(
      { error: "All Mailgun requests failed. No campaign was saved." },
      { status: 502 },
    );
  }

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject: parsed.data.subject,
      previewText: parsed.data.previewText ?? null,
      bodyHtml: safeHtml,
      bodyText,
      recipientCount: delivered,
      failureCount: failures,
    },
  });

  return NextResponse.json({
    ok: true,
    id: campaign.id,
    recipientCount: delivered,
    failureCount: failures,
  });
}
