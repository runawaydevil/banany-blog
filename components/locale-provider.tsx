"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: string | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={normalizeLocale(locale)}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useCurrentLocale(): Locale {
  return useContext(LocaleContext);
}
