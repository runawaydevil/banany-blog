import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { PostDeleteButton } from "@/components/post-delete-button";
import { t } from "@/lib/i18n";

export default async function PostsAdminPage() {
  const [site, posts] = await Promise.all([
    getSiteSettings(),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const locale = site?.locale;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--bb-font-heading)] text-2xl text-[var(--bb-heading)]">
          {t(locale, "nav.posts")}
        </h1>
        <Button asChild>
          <Link href="/dashboard/posts/new">{t(locale, "posts.new")}</Link>
        </Button>
      </div>
      <ul className="divide-y divide-[var(--bb-border)] rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)]">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div>
              <Link
                href={`/dashboard/posts/${post.id}`}
                className="font-medium text-[var(--bb-heading)] hover:underline"
              >
                {post.title || t(locale, "posts.noTitle")}
              </Link>
              <p className="text-xs text-[var(--bb-text-muted)]">
                {post.slug} ·{" "}
                {post.published
                  ? t(locale, "posts.statusPublished")
                  : t(locale, "posts.statusDraft")}{" "}
                · {t(locale, `postType.${post.type.toLowerCase()}`)}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {post.published ? (
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-xs text-[var(--bb-link)] hover:underline"
                >
                  {t(locale, "common.view")}
                </Link>
              ) : (
                <span
                  className="text-xs text-[var(--bb-text-muted)]"
                  title={t(locale, "posts.viewDraftHint")}
                >
                  {t(locale, "posts.viewDraft")}
                </span>
              )}
              <PostDeleteButton
                postId={post.id}
                postTitle={post.title}
                className="text-[var(--bb-danger)] hover:text-[var(--bb-danger)]"
              />
            </div>
          </li>
        ))}
        {posts.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-[var(--bb-text-muted)]">
            {t(locale, "posts.empty")}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
