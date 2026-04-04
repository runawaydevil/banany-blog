"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRESET_LABELS,
  THEME_PRESET_IDS,
  type ThemePresetId,
} from "@/lib/themes";

const PRESETS = [...THEME_PRESET_IDS] as ThemePresetId[];

export default function SetupPage() {
  const router = useRouter();
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
  });

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
      setErr((d as { error?: string }).error || "Setup failed");
      return;
    }
    setDone(true);
    router.push("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <p className="text-center text-sm text-[var(--bb-text-muted)]">Loading…</p>
    );
  }

  if (done) {
    return (
      <p className="text-center text-sm text-[var(--bb-text-muted)]">
        Redirecting to sign in…
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--bb-border)] bg-[var(--bb-surface)] p-8 shadow-sm">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-xl text-[var(--bb-heading)]">
        Welcome to Banany Blog
      </h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerName">Your name</Label>
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
          <Label htmlFor="ownerEmail">Email</Label>
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
          <Label htmlFor="password">Password (min 8)</Label>
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
          <Label htmlFor="siteTitle">Site title</Label>
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
          <Label htmlFor="publicUrl">Public site URL (canonical)</Label>
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
              Taken from <code>APP_URL</code> (or related env) on the server. Change
              the environment variable to use a different public URL.
            </p>
          ) : (
            <p className="text-xs text-[var(--bb-text-muted)]">
              Use the URL users type in the browser (e.g. https://blog.example.com).
              For production, set <code>APP_URL</code> so this cannot drift from your
              deployment.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">Initial theme</Label>
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
          {loading ? "Saving…" : "Finish setup"}
        </Button>
      </form>
    </div>
  );
}
