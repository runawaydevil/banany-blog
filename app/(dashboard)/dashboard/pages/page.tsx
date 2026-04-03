import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PagesAdminPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
          Pages
        </h1>
        <Link
          href="/dashboard/pages/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--bb-accent)] px-4 text-sm font-medium text-[var(--bb-accent-fg)] hover:opacity-90"
        >
          New page
        </Link>
      </div>
      <ul className="divide-y divide-[var(--bb-border)] rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)]">
        {pages.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <Link
              href={`/dashboard/pages/${p.id}`}
              className="font-medium text-[var(--bb-heading)] hover:underline"
            >
              {p.title}
            </Link>
            <Link
              href={`/p/${p.slug}`}
              className="text-xs text-[var(--bb-link)] hover:underline"
            >
              View
            </Link>
          </li>
        ))}
        {pages.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-[var(--bb-text-muted)]">
            No pages yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
