"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { DEFAULT_BRANDING_LOGO } from "@/lib/branding";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@prisma/client";

const links = [
  { href: "/dashboard", key: "nav.dashboard" as const },
  { href: "/dashboard/posts", key: "nav.posts" as const },
  { href: "/dashboard/pages", key: "nav.pages" as const },
  { href: "/dashboard/newsletter", key: "nav.newsletter" as const },
  { href: "/dashboard/appearance", key: "nav.appearance" as const },
  { href: "/dashboard/settings", key: "nav.settings" as const },
];

function navActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardHeader({
  site,
  logoUrl,
}: {
  site: SiteSettings;
  logoUrl: string | null;
}) {
  const loc = site.locale;
  const title = site.dashboardTitle || site.siteTitle;
  const pathname = usePathname() ?? "";

  const linkClass = (href: string) =>
    cn(
      "whitespace-nowrap transition-colors",
      navActive(pathname, href)
        ? "font-medium text-[var(--bb-accent)]"
        : "text-[var(--bb-text-muted)] hover:text-[var(--bb-text)]",
    );

  return (
    <header className="sticky top-0 z-40 bg-[var(--bb-bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl || DEFAULT_BRANDING_LOGO}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain opacity-90"
          />
          <span className="truncate font-[family-name:var(--bb-font-heading)] text-sm font-medium text-[var(--bb-heading)]">
            {title}
          </span>
        </div>

        <nav
          className="hidden items-center gap-x-4 overflow-x-auto text-xs sm:flex sm:text-sm"
          aria-label="Dashboard"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {t(loc, l.key)}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="shrink-0 whitespace-nowrap text-[var(--bb-text-muted)] hover:text-[var(--bb-danger)]"
          >
            Sign out
          </button>
        </nav>

        <details className="relative sm:hidden">
          <summary className="cursor-pointer list-none text-xs text-[var(--bb-text-muted)] [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 flex min-w-[11rem] flex-col gap-0.5 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] p-2 shadow-md">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded px-2 py-2 text-sm",
                  navActive(pathname, l.href)
                    ? "bg-[var(--bb-surface-soft)] font-medium text-[var(--bb-accent)]"
                    : "text-[var(--bb-text)] hover:bg-[var(--bb-surface-soft)]",
                )}
              >
                {t(loc, l.key)}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded px-2 py-2 text-left text-sm text-[var(--bb-text-muted)] hover:bg-[var(--bb-surface-soft)] hover:text-[var(--bb-danger)]"
            >
              Sign out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
