import Link from "next/link";
import type { SiteSettings, NavItem } from "@prisma/client";
import { DEFAULT_BRANDING_LOGO } from "@/lib/branding";
import { t } from "@/lib/i18n";

const REPO = "https://github.com/runawaydevil/banany-blog";

export async function PublicChrome({
  site,
  nav,
  logoUrl,
  children,
}: {
  site: SiteSettings;
  nav: NavItem[];
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  const loc = site.locale;
  const items =
    nav.length > 0
      ? nav
      : [
          { id: "fallback-home", label: t(loc, "nav.home"), href: "/" },
          {
            id: "fallback-archive",
            label: t(loc, "nav.archive"),
            href: "/archive",
          },
        ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[var(--bb-bg)]">
        <div className="mx-auto flex max-w-2xl flex-row items-center justify-between gap-3 px-4 py-4 sm:py-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={DEFAULT_BRANDING_LOGO}
                alt="Banany Blog"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
              />
            )}
            <div className="min-w-0">
              <Link
                href="/"
                className="block truncate font-[family-name:var(--bb-font-heading)] text-base tracking-tight text-[var(--bb-heading)] hover:text-[var(--bb-link)] sm:text-lg"
              >
                {site.siteTitle}
              </Link>
            </div>
          </div>

          <nav
            className="hidden shrink-0 items-center gap-x-5 text-sm text-[var(--bb-text-muted)] sm:flex"
            aria-label="Primary"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="whitespace-nowrap transition-colors hover:text-[var(--bb-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <details className="relative sm:hidden">
            <summary className="cursor-pointer list-none text-sm text-[var(--bb-text-muted)] hover:text-[var(--bb-text)] [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 top-full z-20 mt-2 flex min-w-[10rem] flex-col gap-1 rounded-md border border-[var(--bb-border)]/80 bg-[var(--bb-surface)] p-2 shadow-sm">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded px-2 py-1.5 text-sm text-[var(--bb-text)] hover:bg-[var(--bb-surface-soft)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
      <footer className="mt-auto px-4 py-6 text-center text-[11px] leading-relaxed text-[var(--bb-text-muted)] sm:text-xs">
        <span className="inline">
          {t(loc, "footer.madeWith")}{" "}
          <a
            href={REPO}
            className="text-[var(--bb-link)] underline-offset-2 hover:text-[var(--bb-link-hover)] hover:underline"
          >
            Banany Blog
          </a>{" "}
          {t(loc, "footer.tagline")}
        </span>
      </footer>
    </div>
  );
}
