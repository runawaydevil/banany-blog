"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NavItem, SiteSettings } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const router = useRouter();
  const [siteTitle, setSiteTitle] = useState(site.siteTitle);
  const [browserTitle, setBrowserTitle] = useState(site.browserTitle ?? "");
  const [dashboardTitle, setDashboardTitle] = useState(
    site.dashboardTitle ?? "",
  );
  const [publicUrl, setPublicUrl] = useState(site.publicUrl);
  const [introSnippet, setIntroSnippet] = useState(site.introSnippet ?? "");
  const [locale, setLocale] = useState(site.locale);
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
      : [{ label: "Archive", href: "/archive", order: 0 }],
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
      locale,
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
      toast.error(
        (d as { error?: string }).error || "Could not save settings.",
      );
      return;
    }
    toast.success("Settings saved.");
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
      toast.error((d as { error?: string }).error || "Could not sync URL.");
      return;
    }
    if (trustedPublicUrl) setPublicUrl(trustedPublicUrl);
    toast.success("Public URL updated from environment.");
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
      toast.error("Could not save navigation.");
      return;
    }
    toast.success("Navigation saved.");
    router.refresh();
  }

  function addNavRow() {
    setNav((n) => [...n, { label: "", href: "/", order: n.length }]);
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        Settings
      </h1>

      {isProduction && publicUrlEnvMismatch && trustedPublicUrl ? (
        <div
          className="rounded-md border border-[var(--bb-warning)] bg-[var(--bb-surface-soft)] p-4 text-sm text-[var(--bb-text)]"
          role="status"
        >
          <p className="font-medium text-[var(--bb-heading)]">
            Public URL differs from <code className="text-xs">APP_URL</code>
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
            {syncingUrl ? "Updating…" : "Apply URL from environment"}
          </Button>
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">General</h2>
        <div className="space-y-1">
          <Label>Site title (public)</Label>
          <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Browser title (optional)</Label>
          <Input
            value={browserTitle}
            onChange={(e) => setBrowserTitle(e.target.value)}
            placeholder="Tab title override"
          />
        </div>
        <div className="space-y-1">
          <Label>Dashboard title (optional)</Label>
          <Input
            value={dashboardTitle}
            onChange={(e) => setDashboardTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Public URL</Label>
          <Input
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-xs text-[var(--bb-text-muted)]">
            Prefer defining the canonical URL with <code>APP_URL</code> in
            production so feeds, sitemap, and password reset stay consistent.
          </p>
        </div>
        <div className="space-y-1">
          <Label>Locale</Label>
          <select
            className="flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Intro snippet (homepage)</Label>
          <Textarea
            value={introSnippet}
            onChange={(e) => setIntroSnippet(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-1">
          <Label>Homepage custom page (slug)</Label>
          <select
            className="flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-2 text-sm"
            value={homePageSlug}
            onChange={(e) => setHomePageSlug(e.target.value)}
          >
            <option value="">— Default stream —</option>
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={saveSite} disabled={saving}>
          {saving ? "Saving…" : "Save general"}
        </Button>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          Navigation
        </h2>
        <p className="text-xs text-[var(--bb-text-muted)]">
          Header links on the public site (order top to bottom).
        </p>
        {nav.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <Input
              className="min-w-[100px] flex-1"
              placeholder="Label"
              value={row.label}
              onChange={(e) => {
                const next = [...nav];
                next[i] = { ...next[i], label: e.target.value };
                setNav(next);
              }}
            />
            <Input
              className="min-w-[120px] flex-1"
              placeholder="/path"
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
              Remove
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
            Add link
          </Button>
          <Button type="button" className="h-9" onClick={saveNav}>
            Save navigation
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">SEO</h2>
        <div className="space-y-1">
          <Label>Meta description</Label>
          <Textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>
        <Button type="button" onClick={saveSite} disabled={saving}>
          Save SEO
        </Button>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          Newsletter surfaces
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newsletterHome}
            onChange={(e) => setNewsletterHome(e.target.checked)}
          />
          Show signup on homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newsletterPost}
            onChange={(e) => setNewsletterPost(e.target.checked)}
          />
          Show signup on posts
        </label>
        <Button type="button" onClick={saveSite} disabled={saving}>
          Save newsletter options
        </Button>
      </section>
    </div>
  );
}
