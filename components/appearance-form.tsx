"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRESET_LABELS, THEME_PRESET_IDS, type ThemePresetId } from "@/lib/themes";
import type { SemanticTokens } from "@/lib/themes";
import { DEFAULT_BRANDING_LOGO } from "@/lib/branding";
import { buildFaviconCacheBust, buildFaviconHref } from "@/lib/favicon";

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
  currentUrl,
  emptyLabel,
  inputRef,
  kind,
  onUpload,
  onRemove,
}: {
  currentUrl: string | null;
  emptyLabel: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  kind: "favicon" | "logo";
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
            {kind === "favicon" ? "Favicon" : "Logo"}
          </p>
          <p className="text-xs text-[var(--bb-text-muted)]">
            {currentUrl ? "Current asset attached." : emptyLabel}
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
            none
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
            {currentUrl ? "Replace" : "Upload"}
          </span>
        </label>
        {currentUrl ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void onRemove(kind)}
          >
            Remove
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
  const router = useRouter();
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [themePreset, setThemePreset] = useState(site.themePreset);
  const [customCss, setCustomCss] = useState(site.customCss ?? "");
  const [saving, setSaving] = useState(false);

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
  }, [site.themeOverrides]);

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
        customCss: customCss || null,
        themeOverrides: Object.keys(next).length ? next : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save appearance.");
      return;
    }
    toast.success("Appearance saved.");
    router.refresh();
  }

  async function uploadBranding(kind: "favicon" | "logo", file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("prefix", "branding");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      toast.error("Upload failed.");
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
      toast.error("Could not attach branding to the site.");
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
    toast.success(kind === "favicon" ? "Favicon updated." : "Logo updated.");
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
      toast.error("Could not remove branding.");
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
    toast.success(kind === "favicon" ? "Favicon removed." : "Logo removed.");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        Appearance
      </h1>

      <section className="space-y-3 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          Theme preset
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
        <p className="text-xs text-[var(--bb-text-muted)]">
          Typography stays locked to the preset. Accent and link overrides are
          optional and apply on top of the preset tokens.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="accent">Accent</Label>
            <Input
              id="accent"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              placeholder="Leave empty for preset default"
            />
          </div>
          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Leave empty for preset default"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          Branding assets
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <AssetCard
            currentUrl={faviconUrl}
            emptyLabel="No custom favicon yet."
            inputRef={faviconInputRef}
            kind="favicon"
            onUpload={uploadBranding}
            onRemove={removeBranding}
          />
          <AssetCard
            currentUrl={logoUrl}
            emptyLabel="Using the default Banany mark."
            inputRef={logoInputRef}
            kind="logo"
            onUpload={uploadBranding}
            onRemove={removeBranding}
          />
        </div>
      </section>

      <section className="space-y-2 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          Custom CSS
        </h2>
        <p className="text-xs text-[var(--bb-text-muted)]">
          Injected after theme variables so your rules win predictably. Server
          limit: 120KB.
        </p>
        <Textarea
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          rows={10}
          className="font-mono text-xs"
        />
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save appearance"}
      </Button>
    </div>
  );
}
