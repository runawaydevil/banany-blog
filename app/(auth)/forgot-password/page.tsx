"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const locale = useCurrentLocale();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || t(locale, "forgot.error"));
      return;
    }
    setMsg(t(locale, "forgot.success"));
  }

  return (
    <div className="rounded-lg border border-[var(--bb-border)] bg-[var(--bb-surface)] p-8 shadow-sm">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-xl text-[var(--bb-heading)]">
        {t(locale, "forgot.title")}
      </h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t(locale, "common.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {err ? (
          <p className="text-sm text-[var(--bb-danger)]">{err}</p>
        ) : null}
        {msg ? (
          <p className="text-sm text-[var(--bb-success)]">{msg}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {t(locale, "forgot.action")}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-[var(--bb-link)] hover:underline">
          {t(locale, "common.backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
