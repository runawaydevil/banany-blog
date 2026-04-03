import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardHome() {
  const [postCount, pageCount, mediaCount, subCount] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.media.count(),
    prisma.subscriber.count(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
        Dashboard
      </h1>
      <p className="text-sm text-[var(--bb-text-muted)]">
        Quick overview. Use the header to move between sections.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Posts" value={postCount} href="/dashboard/posts" />
        <Stat label="Pages" value={pageCount} href="/dashboard/pages" />
        <Stat label="Media" value={mediaCount} href="/dashboard/media" />
        <Stat label="Subscribers" value={subCount} href="/dashboard/settings" />
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
