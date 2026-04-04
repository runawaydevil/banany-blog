"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/components/locale-provider";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string | null | undefined;
}) {
  return (
    <LocaleProvider locale={locale}>
      <SessionProvider>{children}</SessionProvider>
    </LocaleProvider>
  );
}
