import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { t } from "@/lib/i18n";

export default async function PagesAdminPage() {
  const [site, pages] = await Promise.all([
    getSiteSettings(),
    prisma.page.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const locale = site?.locale;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
          {t(locale, "nav.pages")}
        </h1>
        <Button asChild>
          <Link href="/dashboard/pages/new">{t(locale, "pages.new")}</Link>
        </Button>
      </div>
      <ul className="divide-y divide-[var(--bb-border)] rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)]">
        {pages.map((page) => (
          <li
            key={page.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <Link
              href={`/dashboard/pages/${page.id}`}
              className="font-medium text-[var(--bb-heading)] hover:underline"
            >
              {page.title}
            </Link>
            <Link
              href={`/p/${page.slug}`}
              className="text-xs text-[var(--bb-link)] hover:underline"
            >
              {t(locale, "common.view")}
            </Link>
          </li>
        ))}
        {pages.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-[var(--bb-text-muted)]">
            {t(locale, "pages.empty")}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
