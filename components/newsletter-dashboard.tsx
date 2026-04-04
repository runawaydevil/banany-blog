"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SemanticTokens } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/tiptap-editor";
import {
  hasRenderableNewsletterBody,
  newsletterHtmlToPlainText,
  renderNewsletterEmail,
} from "@/lib/newsletter";
import { intlLocale, t, tm } from "@/lib/i18n";

type SubscriberRow = {
  id: string;
  email: string;
  createdAt: string;
  unsubscribedAt: string | null;
};

type CampaignRow = {
  id: string;
  subject: string;
  previewText: string | null;
  recipientCount: number;
  failureCount: number;
  sentAt: string;
};

function formatDate(value: string | null, locale: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString(intlLocale(locale));
}

export function NewsletterDashboard({
  bodyFontStack,
  campaigns,
  headingFontStack,
  locale,
  logoUrl,
  siteTitle,
  subscribers,
  tokens,
}: {
  bodyFontStack: string;
  campaigns: CampaignRow[];
  headingFontStack: string;
  locale: string;
  logoUrl: string | null;
  siteTitle: string;
  subscribers: SubscriberRow[];
  tokens: SemanticTokens;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">(
    "all",
  );
  const [sending, setSending] = useState(false);

  const activeCount = subscribers.filter((subscriber) => !subscriber.unsubscribedAt)
    .length;

  const visibleSubscribers = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      if (filter === "active" && subscriber.unsubscribedAt) return false;
      if (filter === "unsubscribed" && !subscriber.unsubscribedAt) return false;
      if (!needle) return true;
      return subscriber.email.toLowerCase().includes(needle);
    });
  }, [filter, search, subscribers]);

  const previewHtml = useMemo(
    () =>
      renderNewsletterEmail({
        bodyHtml,
        bodyFontStack,
        headingFontStack,
        locale,
        logoUrl,
        previewText,
        siteTitle,
        tokens,
        unsubscribeUrl: "#unsubscribe",
      }),
    [
      bodyFontStack,
      bodyHtml,
      headingFontStack,
      locale,
      logoUrl,
      previewText,
      siteTitle,
      tokens,
    ],
  );

  const textFallback = useMemo(() => newsletterHtmlToPlainText(bodyHtml), [
    bodyHtml,
  ]);

  async function sendCampaign() {
    if (!subject.trim()) {
      toast.error(t(locale, "newsletterDashboard.subjectRequired"));
      return;
    }
    if (!hasRenderableNewsletterBody(bodyHtml)) {
      toast.error(t(locale, "newsletterDashboard.bodyRequired"));
      return;
    }

    setSending(true);
    const res = await fetch("/api/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        previewText: previewText.trim() || null,
        bodyHtml,
      }),
    });
    setSending(false);

    const payload = (await res.json().catch(() => ({}))) as {
      error?: string;
      recipientCount?: number;
      failureCount?: number;
    };

    if (!res.ok) {
      toast.error(payload.error || t(locale, "newsletterDashboard.sendError"));
      return;
    }

    const delivered = payload.recipientCount ?? 0;
    const failures = payload.failureCount ?? 0;
    toast.success(
      failures > 0
        ? tm(locale, "newsletterDashboard.sentSummaryWithFailures", {
            count: delivered,
            failures,
          })
        : tm(locale, "newsletterDashboard.sentSummary", {
            count: delivered,
          }),
    );
    setSubject("");
    setPreviewText("");
    setBodyHtml("<p></p>");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
            {t(locale, "newsletterDashboard.title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--bb-text-muted)]">
            {t(locale, "newsletterDashboard.subtitle")}
          </p>
        </div>
        <div className="rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-[var(--bb-text-muted)]">
            {t(locale, "newsletterDashboard.activeSubscribers")}
          </p>
          <p className="text-2xl font-medium text-[var(--bb-heading)]">
            {activeCount}
          </p>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
          <div className="grid gap-4">
            <div className="space-y-1">
              <Label htmlFor="newsletter-subject">
                {t(locale, "newsletterDashboard.subject")}
              </Label>
              <Input
                id="newsletter-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={t(locale, "newsletterDashboard.subjectPlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newsletter-preview">
                {t(locale, "newsletterDashboard.previewText")}
              </Label>
              <Input
                id="newsletter-preview"
                value={previewText}
                onChange={(event) => setPreviewText(event.target.value)}
                placeholder={t(locale, "newsletterDashboard.previewPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t(locale, "newsletterDashboard.body")}</Label>
              <div className="rounded-md border border-[var(--bb-border)] px-4 py-3">
                <TiptapEditor
                  content={bodyHtml}
                  onChange={setBodyHtml}
                  placeholder={t(locale, "newsletterDashboard.bodyPlaceholder")}
                  allowImages={false}
                />
              </div>
              <p className="text-xs text-[var(--bb-text-muted)]">
                {t(locale, "newsletterDashboard.bodyHelp")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={sendCampaign} disabled={sending}>
              {sending
                ? t(locale, "newsletterDashboard.sending")
                : t(locale, "newsletterDashboard.send")}
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
          <div>
            <h2 className="text-sm font-medium text-[var(--bb-heading)]">
              {t(locale, "newsletterDashboard.preview")}
            </h2>
            <p className="mt-1 text-xs text-[var(--bb-text-muted)]">
              {t(locale, "newsletterDashboard.previewHelp")}
            </p>
          </div>
          <div className="max-h-[640px] overflow-auto rounded-md border border-[var(--bb-border)] bg-white">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
          <details className="rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface-soft)] px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-[var(--bb-heading)]">
              {t(locale, "newsletterDashboard.plainText")}
            </summary>
            <Textarea
              readOnly
              value={textFallback}
              rows={10}
              className="mt-3 font-mono text-xs"
            />
          </details>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-[var(--bb-heading)]">
                {t(locale, "newsletterDashboard.subscribers")}
              </h2>
              <p className="mt-1 text-xs text-[var(--bb-text-muted)]">
                {t(locale, "newsletterDashboard.subscribersHelp")}
              </p>
            </div>
            <a
              href="/api/subscribers?format=csv"
              className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--bb-border)] px-3 text-xs font-medium text-[var(--bb-text)] transition-colors hover:bg-[var(--bb-surface-soft)]"
            >
              {t(locale, "newsletterDashboard.exportCsv")}
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t(locale, "newsletterDashboard.searchPlaceholder")}
              className="min-w-[220px] flex-1"
            />
            <div className="flex gap-2">
              {(["all", "active", "unsubscribed"] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={filter === value ? "default" : "outline"}
                  onClick={() => setFilter(value)}
                >
                  {value === "all"
                    ? t(locale, "newsletterDashboard.filterAll")
                    : value === "active"
                      ? t(locale, "newsletterDashboard.filterActive")
                      : t(locale, "newsletterDashboard.filterUnsubscribed")}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[var(--bb-border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--bb-surface-soft)] text-left text-xs uppercase tracking-wide text-[var(--bb-text-muted)]">
                <tr>
                  <th className="px-3 py-2">
                    {t(locale, "newsletterDashboard.tableEmail")}
                  </th>
                  <th className="px-3 py-2">
                    {t(locale, "newsletterDashboard.tableSubscribed")}
                  </th>
                  <th className="px-3 py-2">
                    {t(locale, "newsletterDashboard.tableStatus")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-t border-[var(--bb-border)]/70"
                  >
                    <td className="px-3 py-2 text-[var(--bb-heading)]">
                      {subscriber.email}
                    </td>
                    <td className="px-3 py-2 text-[var(--bb-text-muted)]">
                      {formatDate(subscriber.createdAt, locale)}
                    </td>
                    <td className="px-3 py-2">
                      {subscriber.unsubscribedAt ? (
                        <span className="text-[var(--bb-text-muted)]">
                          {tm(locale, "newsletterDashboard.unsubscribedOn", {
                            date: formatDate(subscriber.unsubscribedAt, locale),
                          })}
                        </span>
                      ) : (
                        <span className="text-[var(--bb-accent)]">
                          {t(locale, "newsletterDashboard.filterActive")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleSubscribers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-sm text-[var(--bb-text-muted)]"
                    >
                      {t(locale, "newsletterDashboard.noSubscribers")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
          <div>
            <h2 className="text-sm font-medium text-[var(--bb-heading)]">
              {t(locale, "newsletterDashboard.recentCampaigns")}
            </h2>
            <p className="mt-1 text-xs text-[var(--bb-text-muted)]">
              {t(locale, "newsletterDashboard.recentCampaignsHelp")}
            </p>
          </div>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface-soft)] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--bb-heading)]">
                      {campaign.subject}
                    </h3>
                    {campaign.previewText ? (
                      <p className="mt-1 text-xs text-[var(--bb-text-muted)]">
                        {campaign.previewText}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs text-[var(--bb-text-muted)]">
                    {formatDate(campaign.sentAt, locale)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--bb-text-muted)]">
                  {tm(locale, "newsletterDashboard.sentTo", {
                    count: campaign.recipientCount,
                    suffix:
                      campaign.failureCount > 0
                        ? tm(locale, "newsletterDashboard.failuresSuffix", {
                            count: campaign.failureCount,
                          })
                        : "",
                  })}
                </p>
              </article>
            ))}
            {campaigns.length === 0 ? (
              <p className="text-sm text-[var(--bb-text-muted)]">
                {t(locale, "newsletterDashboard.noCampaigns")}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
