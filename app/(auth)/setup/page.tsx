"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentLocale } from "@/components/locale-provider";
import { normalizeLocale, t } from "@/lib/i18n";
import {
  PRESET_LABELS,
  THEME_PRESET_IDS,
  type ThemePresetId,
} from "@/lib/themes";

const PRESETS = [...THEME_PRESET_IDS] as ThemePresetId[];

export default function SetupPage() {
  const router = useRouter();
  const appLocale = useCurrentLocale();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [trustedFromEnv, setTrustedFromEnv] = useState(false);
  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    password: "",
    siteTitle: "",
    publicUrl: "",
    themePreset: "paper" as ThemePresetId,
    locale: normalizeLocale(appLocale),
  });
  const uiLocale = form.locale;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const browserLocale = navigator.language.toLowerCase().startsWith("pt")
      ? "pt"
      : normalizeLocale(appLocale);
    setForm((current) => ({
      ...current,
      locale: current.locale || browserLocale,
    }));
  }, [appLocale]);

  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then((d: {
        setupComplete?: boolean;
        suggestedPublicUrl?: string | null;
        trustedPublicUrl?: string | null;
      }) => {
        if (d.setupComplete) {
          router.replace("/login");
          return;
        }
        const fromEnv =
          (typeof d.suggestedPublicUrl === "string" && d.suggestedPublicUrl) ||
          (typeof d.trustedPublicUrl === "string" && d.trustedPublicUrl) ||
          "";
        const fallback =
          typeof window !== "undefined" ? window.location.origin : "";
        setForm((f) => ({
          ...f,
          publicUrl: fromEnv || fallback,
        }));
        setTrustedFromEnv(!!fromEnv);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr((d as { error?: string }).error || t(uiLocale, "setup.failed"));
      return;
    }
    setDone(true);
    router.push("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <p className="text-center text-sm text-[var(--bb-text-muted)]">
        {t(uiLocale, "common.loading")}
      </p>
    );
  }

  if (done) {
    return (
      <p className="text-center text-sm text-[var(--bb-text-muted)]">
        {t(uiLocale, "setup.redirecting")}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--bb-border)] bg-[var(--bb-surface)] p-8 shadow-sm">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-xl text-[var(--bb-heading)]">
        {t(uiLocale, "setup.title")}
      </h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerName">{t(uiLocale, "setup.ownerName")}</Label>
          <Input
            id="ownerName"
            value={form.ownerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, ownerName: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerEmail">{t(uiLocale, "common.email")}</Label>
          <Input
            id="ownerEmail"
            type="email"
            value={form.ownerEmail}
            onChange={(e) =>
              setForm((f) => ({ ...f, ownerEmail: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t(uiLocale, "setup.passwordHint")}</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteTitle">{t(uiLocale, "setup.siteTitle")}</Label>
          <Input
            id="siteTitle"
            value={form.siteTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, siteTitle: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publicUrl">{t(uiLocale, "setup.publicUrl")}</Label>
          <Input
            id="publicUrl"
            type="url"
            value={form.publicUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, publicUrl: e.target.value }))
            }
            required
            readOnly={trustedFromEnv}
            className={trustedFromEnv ? "opacity-90" : undefined}
          />
          {trustedFromEnv ? (
            <p className="text-xs text-[var(--bb-text-muted)]">
              {t(uiLocale, "setup.publicUrlEnvTrusted")}
            </p>
          ) : (
            <p className="text-xs text-[var(--bb-text-muted)]">
              {t(uiLocale, "setup.publicUrlHelp")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-locale">{t(uiLocale, "setup.language")}</Label>
          <select
            id="setup-locale"
            className="flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-3 text-sm"
            value={form.locale}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                locale: normalizeLocale(e.target.value),
              }))
            }
          >
            <option value="en">{t("en", "locale.en")}</option>
            <option value="pt">{t("pt", "locale.pt")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">{t(uiLocale, "setup.initialTheme")}</Label>
          <select
            id="theme"
            className="flex h-9 w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-3 text-sm"
            value={form.themePreset}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                themePreset: e.target.value as ThemePresetId,
              }))
            }
          >
            {PRESETS.map((p) => (
              <option key={p} value={p}>
                {PRESET_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        {err ? (
          <p className="text-sm text-[var(--bb-danger)]">{err}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t(uiLocale, "setup.saving") : t(uiLocale, "setup.finish")}
        </Button>
      </form>
    </div>
  );
}
