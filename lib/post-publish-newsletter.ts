import { Prisma, type PostContentFormat, type PostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendMailgunEmail } from "@/lib/mailgun";
import { getMailgunConfigFromEnv } from "@/lib/mailgun-env";
import { absolutizeMediaUrl, mediaUrlById } from "@/lib/media";
import { fontStackForKey } from "@/lib/fonts-registry";
import {
  finalizeContentExcerptForStorage,
  finalizeExcerptForStorage,
} from "@/lib/excerpt-plain";
import { normalizeLocale, t, tm } from "@/lib/i18n";
import { renderNewsletterEmail, sanitizeNewsletterHtml } from "@/lib/newsletter";
import { getEffectivePublicOrigin } from "@/lib/public-origin";
import { resolveThemeForSite, resolveTypographyForSite } from "@/lib/site";

export type PostPublishNewsletterEligibilityReason =
  | "site_disabled"
  | "post_opt_out"
  | "not_post"
  | "not_first_publication";

export function evaluatePostPublishNewsletterEligibility(input: {
  siteEnabled: boolean;
  currentPublished: boolean;
  nextPublished: boolean;
  type: PostType;
  notifySubscribersOnPublish: boolean;
}):
  | { eligible: true }
  | {
      eligible: false;
      reason: PostPublishNewsletterEligibilityReason;
    } {
  if (!input.siteEnabled) {
    return { eligible: false, reason: "site_disabled" };
  }
  if (!input.notifySubscribersOnPublish) {
    return { eligible: false, reason: "post_opt_out" };
  }
  if (input.type !== "POST") {
    return { eligible: false, reason: "not_post" };
  }
  if (input.currentPublished || !input.nextPublished) {
    return { eligible: false, reason: "not_first_publication" };
  }
  return { eligible: true };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function derivePostPublishTeaser(input: {
  content: string;
  contentFormat?: PostContentFormat | string | null | undefined;
}): string | null {
  return finalizeContentExcerptForStorage(input.content, input.contentFormat);
}

export function buildPostPublishNewsletterContent(input: {
  title: string | null | undefined;
  content: string;
  contentFormat?: PostContentFormat | string | null | undefined;
  locale: string | null | undefined;
  postUrl: string;
}): {
  subject: string;
  previewText: string;
  bodyHtml: string;
  bodyText: string;
  teaser: string | null;
} {
  const teaser = derivePostPublishTeaser({
    content: input.content,
    contentFormat: input.contentFormat,
  });
  const title =
    finalizeExcerptForStorage(input.title)?.trim() ||
    t(input.locale, "newsletterPost.untitled");
  const previewText = teaser ?? title;
  const rawBodyHtml = `
    <h1>${escapeHtml(title)}</h1>
    ${teaser ? `<p>${escapeHtml(teaser)}</p>` : ""}
    <p><a href="${escapeHtml(input.postUrl)}">${escapeHtml(
      t(input.locale, "newsletterPost.cta"),
    )}</a></p>
  `;
  const bodyHtml = sanitizeNewsletterHtml(rawBodyHtml);
  const bodyText = [title, teaser, `${t(input.locale, "newsletterPost.cta")}: ${input.postUrl}`]
    .filter(Boolean)
    .join("\n\n");

  return {
    subject: tm(input.locale, "newsletterPost.subject", { title }),
    previewText,
    bodyHtml,
    bodyText,
    teaser,
  };
}

function campaignStatusFromDelivery(input: {
  delivered: number;
  failures: number;
}): "SENT" | "PARTIAL" | "FAILED" {
  if (input.delivered <= 0) return "FAILED";
  if (input.failures > 0) return "PARTIAL";
  return "SENT";
}

type AutomaticPostNewsletterSkippedReason =
  | "mailgun_unconfigured"
  | "no_active_subscribers"
  | "already_sent"
  | "internal_error";

export type AutomaticPostNewsletterResult =
  | { status: "sent"; delivered: number; failures: number; campaignId: string }
  | {
      status: "partial";
      delivered: number;
      failures: number;
      campaignId: string;
    }
  | {
      status: "skipped";
      reason: AutomaticPostNewsletterSkippedReason;
      campaignId?: string;
    };

export async function sendAutomaticPostPublishNewsletter(input: {
  id: string;
  title: string | null;
  slug: string;
  content: string;
  contentFormat?: PostContentFormat | string | null | undefined;
}): Promise<AutomaticPostNewsletterResult> {
  let campaignId: string | undefined;

  try {
    const site = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (!site) {
      return { status: "skipped", reason: "internal_error" };
    }

    const baseUrl = getEffectivePublicOrigin(site).replace(/\/$/, "");
    const postUrl = `${baseUrl}/posts/${encodeURIComponent(input.slug)}`;
    const locale = normalizeLocale(site.locale);
    const content = buildPostPublishNewsletterContent({
      title: input.title,
      content: input.content,
      contentFormat: input.contentFormat,
      locale,
      postUrl,
    });

    const reservedCampaign = await prisma.newsletterCampaign.create({
      data: {
        kind: "POST_PUBLISH",
        status: "FAILED",
        postId: input.id,
        subject: content.subject,
        previewText: content.previewText,
        bodyHtml: content.bodyHtml,
        bodyText: content.bodyText,
        recipientCount: 0,
        failureCount: 0,
      },
    });
    campaignId = reservedCampaign.id;

    const mailgun = getMailgunConfigFromEnv();
    if (!mailgun) {
      return {
        status: "skipped",
        reason: "mailgun_unconfigured",
        campaignId,
      };
    }

    const subscribers = await prisma.subscriber.findMany({
      where: { unsubscribedAt: null },
      orderBy: { createdAt: "asc" },
    });
    if (subscribers.length === 0) {
      return {
        status: "skipped",
        reason: "no_active_subscribers",
        campaignId,
      };
    }

    const tokens = resolveThemeForSite(site);
    const typography = resolveTypographyForSite(site);
    const [logoUrlRaw] = await Promise.all([mediaUrlById(site.logoMediaId)]);
    const logoUrl = absolutizeMediaUrl(logoUrlRaw, site);
    const bodyFontStack = fontStackForKey(typography.body);
    const headingFontStack = fontStackForKey(typography.heading);

    const results = await Promise.allSettled(
      subscribers.map(async (subscriber) => {
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(
          subscriber.unsubscribeToken,
        )}`;
        const html = renderNewsletterEmail({
          bodyHtml: content.bodyHtml,
          bodyFontStack,
          headingFontStack,
          locale,
          logoUrl,
          previewText: content.previewText,
          siteTitle: site.siteTitle,
          tokens,
          unsubscribeUrl,
        });
        const text = `${content.bodyText}\n\nUnsubscribe: ${unsubscribeUrl}`;

        return sendMailgunEmail({
          apiKey: mailgun.apiKey,
          domain: mailgun.domain,
          region: mailgun.region,
          from: mailgun.from,
          to: subscriber.email,
          subject: content.subject,
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
    const status = campaignStatusFromDelivery({ delivered, failures });

    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status,
        recipientCount: delivered,
        failureCount: failures,
      },
    });

    return status === "PARTIAL"
      ? { status: "partial", delivered, failures, campaignId }
      : status === "SENT"
        ? { status: "sent", delivered, failures, campaignId }
        : { status: "skipped", reason: "internal_error", campaignId };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "skipped", reason: "already_sent", campaignId };
    }

    if (campaignId) {
      await prisma.newsletterCampaign
        .update({
          where: { id: campaignId },
          data: {
            status: "FAILED",
          },
        })
        .catch(() => {});
    }

    console.error("[banany] automatic post newsletter failed", error);
    return { status: "skipped", reason: "internal_error", campaignId };
  }
}
