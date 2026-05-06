import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mergeTokens } from "@/lib/themes";
import { renderNewsletterEmail } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/mailgun", () => ({ sendMailgunEmail: vi.fn() }));
vi.mock("@/lib/mailgun-env", () => ({ getMailgunConfigFromEnv: vi.fn() }));
vi.mock("@/lib/media", () => ({
  absolutizeMediaUrl: vi.fn(),
  mediaUrlById: vi.fn(),
}));
vi.mock("@/lib/fonts-registry", () => ({ fontStackForKey: vi.fn() }));
vi.mock("@/lib/public-origin", () => ({
  getEffectivePublicOrigin: vi.fn(() => "https://example.com"),
}));
vi.mock("@/lib/site", () => ({
  resolveThemeForSite: vi.fn(),
  resolveTypographyForSite: vi.fn(),
}));

import {
  buildPostPublishNewsletterContent,
  derivePostPublishTeaser,
  evaluatePostPublishNewsletterEligibility,
  sendAutomaticPostPublishNewsletter,
} from "@/lib/post-publish-newsletter";

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of Object.keys(prisma)) {
    delete (prisma as unknown as Record<string, unknown>)[key];
  }
});

describe("evaluatePostPublishNewsletterEligibility", () => {
  it("allows a newly created published post", () => {
    expect(
      evaluatePostPublishNewsletterEligibility({
        siteEnabled: true,
        currentPublished: false,
        nextPublished: true,
        type: "POST",
        notifySubscribersOnPublish: true,
      }),
    ).toEqual({ eligible: true });
  });

  it("allows a draft transitioning to published", () => {
    expect(
      evaluatePostPublishNewsletterEligibility({
        siteEnabled: true,
        currentPublished: false,
        nextPublished: true,
        type: "POST",
        notifySubscribersOnPublish: true,
      }),
    ).toEqual({ eligible: true });
  });

  it("does not resend when editing an already published post", () => {
    expect(
      evaluatePostPublishNewsletterEligibility({
        siteEnabled: true,
        currentPublished: true,
        nextPublished: true,
        type: "POST",
        notifySubscribersOnPublish: true,
      }),
    ).toEqual({ eligible: false, reason: "not_first_publication" });
  });

  it("rejects non-POST content types", () => {
    expect(
      evaluatePostPublishNewsletterEligibility({
        siteEnabled: true,
        currentPublished: false,
        nextPublished: true,
        type: "NOTE",
        notifySubscribersOnPublish: true,
      }),
    ).toEqual({ eligible: false, reason: "not_post" });
  });

  it("respects the per-post opt-out", () => {
    expect(
      evaluatePostPublishNewsletterEligibility({
        siteEnabled: true,
        currentPublished: false,
        nextPublished: true,
        type: "POST",
        notifySubscribersOnPublish: false,
      }),
    ).toEqual({ eligible: false, reason: "post_opt_out" });
  });

  it("respects the global site toggle", () => {
    expect(
      evaluatePostPublishNewsletterEligibility({
        siteEnabled: false,
        currentPublished: false,
        nextPublished: true,
        type: "POST",
        notifySubscribersOnPublish: true,
      }),
    ).toEqual({ eligible: false, reason: "site_disabled" });
  });
});

describe("derivePostPublishTeaser", () => {
  it("derives a teaser from the content", () => {
    expect(
      derivePostPublishTeaser({
        content: "<p>Hello <strong>world</strong></p>",
      }),
    ).toBe("Hello world");
  });

  it("derives a teaser from markdown", () => {
    expect(
      derivePostPublishTeaser({
        content: "# Launch\n\n**Bold** move with ![Cover](/uploads/cover.webp)",
        contentFormat: "MARKDOWN",
      }),
    ).toBe("Launch Bold move with Cover");
  });
});

describe("buildPostPublishNewsletterContent", () => {
  it("treats an existing automatic campaign as already sent", async () => {
    const duplicateError = Object.assign(
      Object.create(Prisma.PrismaClientKnownRequestError.prototype),
      { code: "P2002" },
    );

    Object.assign(prisma, {
      siteSettings: {
        findUnique: vi.fn().mockResolvedValue({
          id: "singleton",
          siteTitle: "Banany Blog",
          locale: "en",
          publicUrl: "https://example.com",
        }),
      },
      newsletterCampaign: {
        create: vi.fn().mockRejectedValue(duplicateError),
      },
    });

    const result = await sendAutomaticPostPublishNewsletter({
      id: "post_1",
      title: "Fresh release",
      slug: "fresh-release",
      content: "<p>Hello world</p>",
    });

    expect(result).toEqual({
      status: "skipped",
      reason: "already_sent",
      campaignId: undefined,
    });
  });

  it("builds localized English content from derived teaser", () => {
    const result = buildPostPublishNewsletterContent({
      title: "Fresh release",
      content: "<p>Everything changed.</p>",
      locale: "en",
      postUrl: "https://example.com/posts/fresh-release",
    });

    expect(result.subject).toBe("New post: Fresh release");
    expect(result.previewText).toBe("Everything changed.");
    expect(result.bodyHtml).toContain("Read the post");
    expect(result.bodyText).toContain(
      "Read the post: https://example.com/posts/fresh-release",
    );
  });

  it("builds localized Portuguese content and falls back to body-derived teaser", () => {
    const result = buildPostPublishNewsletterContent({
      title: null,
      content: "# Sem título\n\nUm resumo direto do post.",
      contentFormat: "MARKDOWN",
      locale: "pt",
      postUrl: "https://example.com/posts/novo",
    });

    expect(result.subject).toBe("Novo post: Post sem t\u00edtulo");
    expect(result.previewText).toBe("Sem título Um resumo direto do post.");
    expect(result.bodyHtml).toContain("Ler post");
    expect(result.bodyText).toContain(
      "Ler post: https://example.com/posts/novo",
    );
  });

  it("keeps the automatic email compatible with the themed renderer and locale chrome", () => {
    const content = buildPostPublishNewsletterContent({
      title: "Fresh release",
      content: "<p>Everything changed.</p>",
      locale: "pt",
      postUrl: "https://example.com/posts/fresh-release",
    });

    const html = renderNewsletterEmail({
      bodyHtml: content.bodyHtml,
      bodyFontStack: "Georgia, serif",
      headingFontStack: "Newsreader, serif",
      locale: "pt",
      previewText: content.previewText,
      siteTitle: "Banany Blog",
      tokens: mergeTokens("vaporwave-neon", undefined),
      unsubscribeUrl: "https://example.com/unsubscribe?token=abc",
    });

    expect(html).toContain('lang="pt-BR"');
    expect(html).toContain("Ler post");
    expect(html).toContain("Cancelar inscri\u00e7\u00e3o instantaneamente");
  });
});
