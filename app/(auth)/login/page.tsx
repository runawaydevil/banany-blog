"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentLocale } from "@/components/locale-provider";
import { resolveLoginCallbackUrl } from "@/lib/callback-url";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const locale = useCurrentLocale();
  const search = useSearchParams();
  const callbackUrl = useMemo(
    () => resolveLoginCallbackUrl(search.get("callbackUrl")),
    [search],
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setErr(t(locale, "login.invalidCredentials"));
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="rounded-lg border border-[var(--bb-border)] bg-[var(--bb-surface)] p-8 shadow-sm">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-xl text-[var(--bb-heading)]">
        {t(locale, "login.title")}
      </h1>
      <p className="mt-1 text-sm text-[var(--bb-text-muted)]">
        {t(locale, "login.subtitle")}
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t(locale, "common.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t(locale, "common.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {err ? (
          <p className="text-sm text-[var(--bb-danger)]">{err}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t(locale, "login.loading") : t(locale, "login.action")}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--bb-text-muted)]">
        <Link href="/forgot-password" className="hover:underline">
          {t(locale, "login.forgotPassword")}
        </Link>
      </p>
    </div>
  );
}
