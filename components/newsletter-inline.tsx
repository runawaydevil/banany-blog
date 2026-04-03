"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n";

export function NewsletterInline({ locale }: { locale: string }) {
  const loc = locale === "pt" ? "pt" : "en";
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setMsg(t(loc as Locale, "newsletter.success"));
      setEmail("");
    } else {
      setMsg("Could not subscribe.");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4"
    >
      <div className="flex-1">
        <label className="sr-only" htmlFor="nl-email">
          Email
        </label>
        <Input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(loc as Locale, "newsletter.placeholder")}
          className="max-w-xs"
        />
      </div>
      <Button type="submit" variant="outline" size="sm">
        {t(loc as Locale, "newsletter.button")}
      </Button>
      {msg ? (
        <p className="text-sm text-[var(--bb-text-muted)] sm:ml-2">{msg}</p>
      ) : null}
    </form>
  );
}
