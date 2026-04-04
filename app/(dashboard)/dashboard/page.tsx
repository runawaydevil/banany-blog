import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { t } from "@/lib/i18n";

export default async function DashboardHome() {
  const [site, postCount, pageCount, subCount, campaignCount] = await Promise.all([
    getSiteSettings(),
    prisma.post.count(),
    prisma.page.count(),
    prisma.subscriber.count({ where: { unsubscribedAt: null } }),
    prisma.newsletterCampaign.count(),
  ]);

  const locale = site?.locale;

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        {t(locale, "nav.dashboard")}
      </h1>
      <p className="text-sm text-[var(--bb-text-muted)]">
        {t(locale, "dashboard.overview")}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t(locale, "dashboard.stats.posts")}
          value={postCount}
          href="/dashboard/posts"
        />
        <Stat
          label={t(locale, "dashboard.stats.pages")}
          value={pageCount}
          href="/dashboard/pages"
        />
        <Stat
          label={t(locale, "dashboard.stats.subscribers")}
          value={subCount}
          href="/dashboard/newsletter"
        />
        <Stat
          label={t(locale, "dashboard.stats.campaigns")}
          value={campaignCount}
          href="/dashboard/newsletter"
        />
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] px-4 py-3 transition-colors hover:bg-[var(--bb-surface-soft)]"
      >
        <p className="text-xs text-[var(--bb-text-muted)]">{label}</p>
        <p className="text-2xl font-medium tabular-nums text-[var(--bb-heading)]">
          {value}
        </p>
      </Link>
    </li>
  );
}
