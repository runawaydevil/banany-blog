"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

function Form() {
  const locale = useCurrentLocale();
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || t(locale, "reset.error"));
      return;
    }
    setOk(true);
  }

  if (!token) {
    return (
      <p className="text-sm text-[var(--bb-danger)]">
        {t(locale, "reset.missingToken")}
      </p>
    );
  }

  if (ok) {
    return (
      <p className="text-sm text-[var(--bb-success)]">
        {t(locale, "reset.success")}{" "}
        <Link href="/login" className="underline">
          {t(locale, "login.action")}
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{t(locale, "reset.newPassword")}</Label>
        <Input
          id="password"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {err ? (
        <p className="text-sm text-[var(--bb-danger)]">{err}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {t(locale, "reset.action")}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const locale = useCurrentLocale();
  return (
    <div className="rounded-lg border border-[var(--bb-border)] bg-[var(--bb-surface)] p-8 shadow-sm">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-xl text-[var(--bb-heading)]">
        {t(locale, "reset.title")}
      </h1>
      <div className="mt-6">
        <Suspense
          fallback={
            <p className="text-sm text-[var(--bb-text-muted)]">
              {t(locale, "common.loading")}
            </p>
          }
        >
          <Form />
        </Suspense>
      </div>
    </div>
  );
}
