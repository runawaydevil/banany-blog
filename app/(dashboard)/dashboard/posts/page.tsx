import Link from "next/link";
import { prisma } from "@/lib/prisma";
export default async function PostsAdminPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
          Posts
        </h1>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--bb-accent)] px-4 text-sm font-medium text-[var(--bb-accent-fg)] hover:opacity-90"
        >
          New post
        </Link>
      </div>
      <ul className="divide-y divide-[var(--bb-border)] rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)]">
        {posts.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <Link
                href={`/dashboard/posts/${p.id}`}
                className="font-medium text-[var(--bb-heading)] hover:underline"
              >
                {p.title || "(no title)"}
              </Link>
              <p className="text-xs text-[var(--bb-text-muted)]">
                {p.slug} · {p.published ? "published" : "draft"} · {p.type}
              </p>
            </div>
            {p.published ? (
              <Link
                href={`/posts/${p.slug}`}
                className="text-xs text-[var(--bb-link)] hover:underline"
              >
                View
              </Link>
            ) : (
              <span className="text-xs text-[var(--bb-text-muted)]" title="Publish the post to open it on the public site">
                View (draft)
              </span>
            )}
          </li>
        ))}
        {posts.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-[var(--bb-text-muted)]">
            No posts yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
