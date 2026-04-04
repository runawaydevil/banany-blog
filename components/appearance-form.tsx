"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentLocale } from "@/components/locale-provider";
import { PRESET_LABELS, THEME_PRESET_IDS, type ThemePresetId } from "@/lib/themes";
import type { SemanticTokens } from "@/lib/themes";
import { DEFAULT_BRANDING_LOGO } from "@/lib/branding";
import { buildFaviconCacheBust, buildFaviconHref } from "@/lib/favicon";
import { t } from "@/lib/i18n";

const PRESETS = [...THEME_PRESET_IDS] as ThemePresetId[];

type SitePatchResponse = {
  ok: true;
  id: string;
  updatedAt: string;
  faviconMediaId: string | null;
  logoMediaId: string | null;
};

function parseOverrides(raw: unknown): Partial<SemanticTokens> {
  if (!raw || typeof raw !== "object") return {};
  return raw as Partial<SemanticTokens>;
}

function updateBrowserFavicon(bust: string) {
  if (typeof document === "undefined") return;

  const href = buildFaviconHref(bust);
  const rels = ["icon", "shortcut icon", "apple-touch-icon"];

  for (const rel of rels) {
    let link = document.head.querySelector<HTMLLinkElement>(
      `link[rel="${rel}"]`,
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  }
}

function AssetCard({
  title,
  currentUrl,
  currentLabel,
  emptyLabel,
  inputRef,
  kind,
  removeLabel,
  replaceLabel,
  uploadLabel,
  onUpload,
  onRemove,
}: {
  title: string;
  currentUrl: string | null;
  currentLabel: string;
  emptyLabel: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  kind: "favicon" | "logo";
  removeLabel: string;
  replaceLabel: string;
  uploadLabel: string;
  onUpload: (kind: "favicon" | "logo", file: File) => Promise<void>;
  onRemove: (kind: "favicon" | "logo") => Promise<void>;
}) {
  const previewUrl =
    currentUrl || (kind === "logo" ? DEFAULT_BRANDING_LOGO : null);

  return (
    <div className="space-y-3 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface-soft)]/55 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--bb-heading)]">
            {title}
          </p>
          <p className="text-xs text-[var(--bb-text-muted)]">
            {currentUrl ? currentLabel : emptyLabel}
          </p>
        </div>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            width={kind === "favicon" ? 32 : 72}
            height={kind === "favicon" ? 32 : 72}
            className={
              kind === "favicon"
                ? "h-8 w-8 rounded-sm border border-[var(--bb-border)] bg-[var(--bb-surface)] object-contain p-1"
                : "h-14 w-14 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] object-contain p-1.5"
            }
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-dashed border-[var(--bb-border)] text-[10px] text-[var(--bb-text-muted)]">
            —
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(kind, file);
            }}
          />
          <span className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--bb-border)] px-3 text-xs font-medium text-[var(--bb-text)] transition-colors hover:bg-[var(--bb-surface)]">
            {currentUrl ? replaceLabel : uploadLabel}
          </span>
        </label>
        {currentUrl ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void onRemove(kind)}
          >
            {removeLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function AppearanceForm({
  site,
  faviconUrl,
  logoUrl,
}: {
  site: SiteSettings;
  faviconUrl: string | null;
  logoUrl: string | null;
}) {
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [themePreset, setThemePreset] = useState(site.themePreset);
  const [locale, setLocale] = useState(site.locale);
  const [customCss, setCustomCss] = useState(site.customCss ?? "");
  const [saving, setSaving] = useState(false);
  const uiLocale = locale || currentLocale;

  const initialOv = useMemo(
    () => parseOverrides(site.themeOverrides),
    [site.themeOverrides],
  );
  const [accent, setAccent] = useState(initialOv.accent ?? "");
  const [link, setLink] = useState(initialOv.link ?? "");

  useEffect(() => {
    const o = parseOverrides(site.themeOverrides);
    setAccent(o.accent ?? "");
    setLink(o.link ?? "");
    setLocale(site.locale);
  }, [site.locale, site.themeOverrides]);

  async function save() {
    setSaving(true);
    const existing = parseOverrides(site.themeOverrides);
    const next: Record<string, string> = { ...existing };
    if (accent.trim()) next.accent = accent.trim();
    else delete next.accent;
    if (link.trim()) next.link = link.trim();
    else delete next.link;

    const res = await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        themePreset,
        locale,
        customCss: customCss || null,
        themeOverrides: Object.keys(next).length ? next : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t(uiLocale, "appearance.saveError"));
      return;
    }
    toast.success(t(uiLocale, "appearance.saved"));
    router.refresh();
  }

  async function uploadBranding(kind: "favicon" | "logo", file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("prefix", "branding");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      toast.error(t(uiLocale, "appearance.uploadError"));
      return;
    }
    const data = (await res.json()) as { id: string };
    const field = kind === "favicon" ? "faviconMediaId" : "logoMediaId";
    const patchRes = await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: data.id }),
    });
    if (!patchRes.ok) {
      toast.error(t(uiLocale, "appearance.attachError"));
      return;
    }
    const patchData = (await patchRes.json()) as SitePatchResponse;
    if (kind === "favicon") {
      updateBrowserFavicon(
        buildFaviconCacheBust({
          updatedAt: patchData.updatedAt,
          faviconMediaId: patchData.faviconMediaId,
        }),
      );
    }
    toast.success(
      t(
        uiLocale,
        kind === "favicon"
          ? "appearance.faviconUpdated"
          : "appearance.logoUpdated",
      ),
    );
    if (kind === "favicon" && faviconInputRef.current) {
      faviconInputRef.current.value = "";
    }
    if (kind === "logo" && logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    router.refresh();
  }

  async function removeBranding(kind: "favicon" | "logo") {
    const field = kind === "favicon" ? "faviconMediaId" : "logoMediaId";
    const res = await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: null }),
    });
    if (!res.ok) {
      toast.error(t(uiLocale, "appearance.removeError"));
      return;
    }
    const patchData = (await res.json()) as SitePatchResponse;
    if (kind === "favicon") {
      updateBrowserFavicon(
        buildFaviconCacheBust({
          updatedAt: patchData.updatedAt,
          faviconMediaId: patchData.faviconMediaId,
        }),
      );
    }
    toast.success(
      t(
        uiLocale,
        kind === "favicon"
          ? "appearance.faviconRemoved"
          : "appearance.logoRemoved",
      ),
    );
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        {t(uiLocale, "appearance.title")}
      </h1>

      <section className="space-y-3 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(uiLocale, "appearance.themePreset")}
        </h2>
        <select
          className="flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-2 text-sm"
          value={themePreset}
          onChange={(e) => setThemePreset(e.target.value)}
        >
          {PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {PRESET_LABELS[preset]}
            </option>
          ))}
        </select>
        <div>
          <Label htmlFor="appearance-locale">
            {t(uiLocale, "appearance.language")}
          </Label>
          <select
            id="appearance-locale"
            className="mt-1 flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            <option value="en">{t("en", "locale.en")}</option>
            <option value="pt">{t("pt", "locale.pt")}</option>
          </select>
        </div>
        <p className="text-xs text-[var(--bb-text-muted)]">
          {t(uiLocale, "appearance.typographyLocked")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="accent">{t(uiLocale, "appearance.accent")}</Label>
            <Input
              id="accent"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              placeholder={t(uiLocale, "appearance.usePresetDefault")}
            />
          </div>
          <div>
            <Label htmlFor="link">{t(uiLocale, "appearance.link")}</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={t(uiLocale, "appearance.usePresetDefault")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(uiLocale, "appearance.brandingAssets")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <AssetCard
            title="Favicon"
            currentUrl={faviconUrl}
            currentLabel={t(uiLocale, "appearance.currentAsset")}
            emptyLabel={t(uiLocale, "appearance.noCustomFavicon")}
            inputRef={faviconInputRef}
            kind="favicon"
            removeLabel={t(uiLocale, "common.remove")}
            replaceLabel={t(uiLocale, "common.replace")}
            uploadLabel={t(uiLocale, "common.upload")}
            onUpload={uploadBranding}
            onRemove={removeBranding}
          />
          <AssetCard
            title="Logo"
            currentUrl={logoUrl}
            currentLabel={t(uiLocale, "appearance.currentAsset")}
            emptyLabel={t(uiLocale, "appearance.defaultLogo")}
            inputRef={logoInputRef}
            kind="logo"
            removeLabel={t(uiLocale, "common.remove")}
            replaceLabel={t(uiLocale, "common.replace")}
            uploadLabel={t(uiLocale, "common.upload")}
            onUpload={uploadBranding}
            onRemove={removeBranding}
          />
        </div>
      </section>

      <section className="space-y-2 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          {t(uiLocale, "appearance.customCss")}
        </h2>
        <p className="text-xs text-[var(--bb-text-muted)]">
          {t(uiLocale, "appearance.customCssHelp")}
        </p>
        <Textarea
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          rows={10}
          className="font-mono text-xs"
        />
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving
          ? t(uiLocale, "appearance.saving")
          : t(uiLocale, "appearance.save")}
      </Button>
    </div>
  );
}
