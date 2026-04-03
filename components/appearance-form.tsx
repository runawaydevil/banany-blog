"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRESET_LABELS, type ThemePresetId } from "@/lib/themes";
import type { SemanticTokens } from "@/lib/themes";

const PRESETS = Object.keys(PRESET_LABELS) as ThemePresetId[];

function parseOverrides(raw: unknown): Partial<SemanticTokens> {
  if (!raw || typeof raw !== "object") return {};
  return raw as Partial<SemanticTokens>;
}

export function AppearanceForm({ site }: { site: SiteSettings }) {
  const router = useRouter();
  const [themePreset, setThemePreset] = useState(site.themePreset);
  const [customCss, setCustomCss] = useState(site.customCss ?? "");
  const [msg, setMsg] = useState<string | null>(null);
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
    setMsg(null);
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
      setMsg("Could not save.");
      return;
    }
    setMsg("Saved.");
    router.refresh();
  }

  async function uploadBranding(
    kind: "favicon" | "logo" | "siteImage",
    file: File,
  ) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("prefix", "branding");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const data = (await res.json()) as { id: string };
    const field =
      kind === "favicon"
        ? "faviconMediaId"
        : kind === "logo"
          ? "logoMediaId"
          : "siteImageMediaId";
    await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: data.id }),
    });
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
          {PRESETS.map((p) => (
            <option key={p} value={p}>
              {PRESET_LABELS[p]}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--bb-text-muted)]">
          Typography is paired with each preset (editorial for Paper/Ink; clear
          sans for Catppuccin). Optional hex overrides for accent and link (e.g.
          #c4a574).
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
          Branding uploads
        </h2>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="cursor-pointer rounded border border-[var(--bb-border)] px-2 py-1 hover:bg-[var(--bb-surface-soft)]">
            Favicon
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadBranding("favicon", f);
              }}
            />
          </label>
          <label className="cursor-pointer rounded border border-[var(--bb-border)] px-2 py-1 hover:bg-[var(--bb-surface-soft)]">
            Logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadBranding("logo", f);
              }}
            />
          </label>
          <label className="cursor-pointer rounded border border-[var(--bb-border)] px-2 py-1 hover:bg-[var(--bb-surface-soft)]">
            Site image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadBranding("siteImage", f);
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-2 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-4">
        <h2 className="text-sm font-medium text-[var(--bb-heading)]">
          Custom CSS
        </h2>
        <p className="text-xs text-[var(--bb-text-muted)]">
          Applied after theme tokens. Max 120KB server-side.
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
      {msg ? <p className="text-sm text-[var(--bb-text-muted)]">{msg}</p> : null}
    </div>
  );
}
