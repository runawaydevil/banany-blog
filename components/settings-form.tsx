"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NavItem, SiteSettings } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

type PageOpt = { slug: string; title: string };

export function SettingsForm({
  site,
  navItems,
  pages,
  trustedPublicUrl,
  publicUrlEnvMismatch,
  isProduction,
}: {
  site: SiteSettings;
  navItems: NavItem[];
  pages: PageOpt[];
  trustedPublicUrl: string | null;
  publicUrlEnvMismatch: boolean;
  isProduction: boolean;
}) {
  const locale = useCurrentLocale();
  const router = useRouter();
  const [siteTitle, setSiteTitle] = useState(site.siteTitle);
  const [browserTitle, setBrowserTitle] = useState(site.browserTitle ?? "");
  const [dashboardTitle, setDashboardTitle] = useState(
    site.dashboardTitle ?? "",
  );
  const [publicUrl, setPublicUrl] = useState(site.publicUrl);
  const [introSnippet, setIntroSnippet] = useState(site.introSnippet ?? "");
  const [seoDescription, setSeoDescription] = useState(
    site.seoDescription ?? "",
  );
  const [homePageSlug, setHomePageSlug] = useState(site.homePageSlug ?? "");
  const [newsletterHome, setNewsletterHome] = useState(
    site.newsletterEnabledHome,
  );
  const [newsletterPost, setNewsletterPost] = useState(
    site.newsletterEnabledPost,
  );

  const [nav, setNav] = useState<
    { label: string; href: string; order: number }[]
  >(
    navItems.length
      ? navItems.map((n, i) => ({
          label: n.label,
          href: n.href,
          order: n.order ?? i,
        }))
      : [{ label: t(locale, "nav.archive"), href: "/archive", order: 0 }],
  );

  const [saving, setSaving] = useState(false);
  const [syncingUrl, setSyncingUrl] = useState(false);

  async function saveSite() {
    setSaving(true);
    const body: Record<string, unknown> = {
      siteTitle,
      browserTitle: browserTitle.trim() || null,
      dashboardTitle: dashboardTitle.trim() || null,
      publicUrl,
      introSnippet: introSnippet.trim() || null,
      seoDescription: seoDescription.trim() || null,
      homePageSlug: homePageSlug.trim() || null,
      newsletterEnabledHome: newsletterHome,
      newsletterEnabledPost: newsletterPost,
    };
    const res = await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error((d as { error?: string }).error || t(locale, "settings.saveError"));
      return;
    }
    toast.success(t(locale, "settings.saved"));
    router.refresh();
  }

  async function applyEnvPublicUrl() {
    setSyncingUrl(true);
    const res = await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applyTrustedPublicUrl: true }),
    });
    setSyncingUrl(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(
        (d as { error?: string }).error || t(locale, "settings.urlMismatchError"),
      );
      return;
    }
    if (trustedPublicUrl) setPublicUrl(trustedPublicUrl);
    toast.success(t(locale, "settings.urlMismatchApplied"));
    router.refresh();
  }

  async function saveNav() {
    const res = await fetch("/api/nav", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        nav.map((n, i) => ({
          label: n.label.trim(),
          href: n.href.trim(),
          order: i,
        })),
      ),
    });
    if (!res.ok) {
      toast.error(t(locale, "settings.navigationSaveError"));
      return;
    }
    toast.success(t(locale, "settings.navigationSaved"));
    router.refresh();
  }

  function addNavRow() {
    setNav((items) => [...items, { label: "", href: "/", order: items.length }]);
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        {t(locale, "settings.title")}
      </h1>

      {isProduction && publicUrlEnvMismatch && trustedPublicUrl ? (
        <div
          className="rounded-md border border-[var(--bb-warning)] bg-[var(--bb-surface-soft)] p-4 text-sm text-[var(--bb-text)]"
          role="status"
        >
          <p className="font-medium text-[var(--bb-heading)]">
            {t(locale, "settings.urlMismatchTitle")}{" "}
            <code className="text-xs">APP_URL</code>
          </p>
          <p className="mt-1 text-[var(--bb-text-muted)]">
            Database: <code className="text-xs">{site.publicUrl}</code>
            <br />
            Environment: <code className="text-xs">{trustedPublicUrl}</code>
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={applyEnvPublicUrl}
            disabled={syncingUrl}
          >
            {syncingUrl
              ? t(locale, "settings.urlMismatchApplying")
              : t(locale, "settings.urlMismatchAction")}
          </Button>
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(locale, "settings.general")}
        </h2>
        <div className="space-y-1">
          <Label>{t(locale, "settings.siteTitle")}</Label>
          <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>{t(locale, "settings.browserTitle")}</Label>
          <Input
            value={browserTitle}
            onChange={(e) => setBrowserTitle(e.target.value)}
            placeholder={t(locale, "settings.browserTitlePlaceholder")}
          />
        </div>
        <div className="space-y-1">
          <Label>{t(locale, "settings.dashboardTitle")}</Label>
          <Input
            value={dashboardTitle}
            onChange={(e) => setDashboardTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>{t(locale, "settings.publicUrl")}</Label>
          <Input
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-xs text-[var(--bb-text-muted)]">
            {t(locale, "settings.publicUrlHelp")}
          </p>
        </div>
        <div className="space-y-1">
          <Label>{t(locale, "settings.introSnippet")}</Label>
          <Textarea
            value={introSnippet}
            onChange={(e) => setIntroSnippet(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-1">
          <Label>{t(locale, "settings.homePageSlug")}</Label>
          <select
            className="flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-2 text-sm"
            value={homePageSlug}
            onChange={(e) => setHomePageSlug(e.target.value)}
          >
            <option value="">{t(locale, "settings.homePageDefault")}</option>
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={saveSite} disabled={saving}>
          {saving ? t(locale, "appearance.saving") : t(locale, "settings.saveGeneral")}
        </Button>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(locale, "settings.navigation")}
        </h2>
        <p className="text-xs text-[var(--bb-text-muted)]">
          {t(locale, "settings.navigationHelp")}
        </p>
        {nav.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <Input
              className="min-w-[100px] flex-1"
              placeholder={t(locale, "settings.labelPlaceholder")}
              value={row.label}
              onChange={(e) => {
                const next = [...nav];
                next[i] = { ...next[i], label: e.target.value };
                setNav(next);
              }}
            />
            <Input
              className="min-w-[120px] flex-1"
              placeholder={t(locale, "settings.pathPlaceholder")}
              value={row.href}
              onChange={(e) => {
                const next = [...nav];
                next[i] = { ...next[i], href: e.target.value };
                setNav(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0"
              onClick={() => setNav(nav.filter((_, j) => j !== i))}
            >
              {t(locale, "common.remove")}
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={addNavRow}
          >
            {t(locale, "settings.addLink")}
          </Button>
          <Button type="button" className="h-9" onClick={saveNav}>
            {t(locale, "settings.saveNavigation")}
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(locale, "settings.seo")}
        </h2>
        <div className="space-y-1">
          <Label>{t(locale, "settings.metaDescription")}</Label>
          <Textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>
        <Button type="button" onClick={saveSite} disabled={saving}>
          {saving ? t(locale, "appearance.saving") : t(locale, "settings.saveSeo")}
        </Button>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(locale, "settings.newsletterSurfaces")}
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newsletterHome}
            onChange={(e) => setNewsletterHome(e.target.checked)}
          />
          {t(locale, "settings.newsletterHome")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newsletterPost}
            onChange={(e) => setNewsletterPost(e.target.checked)}
          />
          {t(locale, "settings.newsletterPost")}
        </label>
        <Button type="button" onClick={saveSite} disabled={saving}>
          {saving
            ? t(locale, "appearance.saving")
            : t(locale, "settings.saveNewsletter")}
        </Button>
      </section>
    </div>
  );
}
