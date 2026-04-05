"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Post, PostType } from "@prisma/client";
import { useCurrentLocale } from "@/components/locale-provider";
import { PostMarkdownEditor } from "@/components/post-markdown-editor";
import { TiptapEditor } from "@/components/tiptap-editor";
import { EditorShell } from "@/components/editor/editor-shell";
import {
  EditorTopBar,
  EditorMoreMenu,
} from "@/components/editor/editor-top-bar";
import { PostMetadataPanel } from "@/components/editor/post-metadata-panel";
import { PostDeleteButton } from "@/components/post-delete-button";
import type { SaveUiState } from "@/components/editor/save-state-indicator";
import {
  finalizeExcerptForStorage,
  hasRenderablePostContent,
} from "@/lib/excerpt-plain";
import { t, tm } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PostContentFormatValue = "RICH_TEXT" | "MARKDOWN";

type PostPublishNewsletterUiResult = {
  status: "sent" | "partial" | "skipped";
  delivered?: number;
  failures?: number;
  reason?:
    | "mailgun_unconfigured"
    | "no_active_subscribers"
    | "already_sent"
    | "internal_error";
  campaignId?: string;
};

type PostMutationResponse = Post & {
  newsletter?: PostPublishNewsletterUiResult;
};

function toDatetimeLocalValue(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toastPublishNewsletterResult(
  locale: string,
  newsletter: PostPublishNewsletterUiResult | undefined,
) {
  if (!newsletter) return;

  if (newsletter.status === "sent") {
    toast.success(t(locale, "editor.newsletterSent"));
    return;
  }

  if (newsletter.status === "partial") {
    toast.error(
      tm(locale, "editor.newsletterPartial", {
        failures: newsletter.failures ?? 0,
      }),
    );
    return;
  }

  if (newsletter.reason === "mailgun_unconfigured") {
    toast.message(t(locale, "editor.newsletterSkippedNoMailgun"));
    return;
  }
  if (newsletter.reason === "no_active_subscribers") {
    toast.message(t(locale, "editor.newsletterSkippedNoSubscribers"));
    return;
  }
  if (newsletter.reason === "internal_error") {
    toast.error(t(locale, "editor.newsletterFailed"));
  }
}

export function PostForm({ initial }: { initial?: Post }) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const initialContentFormat: PostContentFormatValue =
    initial?.contentFormat === "MARKDOWN" ? "MARKDOWN" : "RICH_TEXT";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [contentFormat, setContentFormat] =
    useState<PostContentFormatValue>(initialContentFormat);
  const [content, setContent] = useState(
    initial?.content ?? (initialContentFormat === "MARKDOWN" ? "" : "<p></p>"),
  );
  const [type, setType] = useState<PostType>(initial?.type ?? "POST");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [notifySubscribersOnPublish, setNotifySubscribersOnPublish] = useState(
    initial?.notifySubscribersOnPublish ?? true,
  );
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt
      ? toDatetimeLocalValue(new Date(initial.scheduledAt))
      : toDatetimeLocalValue(),
  );
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const payload = useCallback(() => {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return {
      title: title.trim() || null,
      content,
      contentFormat,
      type,
      tags: tagList,
      linkUrl: linkUrl.trim() || null,
      excerpt: finalizeExcerptForStorage(excerpt),
      published,
      notifySubscribersOnPublish,
      pinned,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    };
  }, [
    title,
    content,
    contentFormat,
    type,
    tags,
    linkUrl,
    excerpt,
    published,
    notifySubscribersOnPublish,
    pinned,
    scheduledAt,
  ]);

  const fingerprint = useMemo(() => JSON.stringify(payload()), [payload]);

  const [savedFingerprint, setSavedFingerprint] = useState(() =>
    initial ? JSON.stringify(payload()) : fingerprint,
  );

  useEffect(() => {
    if (initial?.id) {
      setSavedFingerprint(JSON.stringify(payload()));
    }
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- reset baseline when switching post

  const isDirty = fingerprint !== savedFingerprint;
  const bodyIsEmpty = !hasRenderablePostContent(content, contentFormat);

  const saveUiState: SaveUiState = saving
    ? "saving"
    : isDirty
      ? "unsaved"
      : savedAt
        ? "saved"
        : "idle";

  const save = useCallback(
    async (
      silent = false,
      overrides?: Partial<ReturnType<typeof payload>>,
    ): Promise<boolean> => {
      if (!initial && bodyIsEmpty) {
        if (!silent) {
          setErr(t(locale, "editor.addTextBeforeSaving"));
          toast.error(t(locale, "editor.addTextBeforeSaving"));
        }
        return false;
      }
      setErr(null);
      if (!silent) setSaving(true);
      try {
        const body = { ...payload(), ...overrides };
        const url = initial ? `/api/posts/${initial.id}` : "/api/posts";
        const method = initial ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || t(locale, "editor.saveFailed"));
        }
        const saved = (await res.json()) as PostMutationResponse;
        if (overrides?.published === true) setPublished(true);
        setSavedFingerprint(JSON.stringify(body));
        setSavedAt(new Date());
        if (!initial) {
          router.replace(`/dashboard/posts/${saved.id}`);
        }
        router.refresh();
        if (!silent) {
          if (overrides?.published === true) {
            toast.success(
              initial?.published
                ? t(locale, "editor.postUpdated")
                : t(locale, "editor.postPublished"),
            );
          } else {
            toast.success(t(locale, "editor.postSaved"));
          }
          if (body.published === true) {
            toastPublishNewsletterResult(locale, saved.newsletter);
          }
        }
        return true;
      } catch (e) {
        const message =
          e instanceof Error && e.message
            ? e.message
            : t(locale, "editor.saveFailed");
        setErr(message);
        if (!silent) toast.error(message);
        return false;
      } finally {
        if (!silent) setSaving(false);
      }
    },
    [bodyIsEmpty, initial, payload, router, locale],
  );

  useEffect(() => {
    if (!initial || !isDirty) return;
    const t = setTimeout(() => {
      void save(true);
    }, 2200);
    return () => clearTimeout(t);
  }, [initial, isDirty, fingerprint, save]);

  const metadataPanel = (
    <PostMetadataPanel
      type={type}
      onTypeChange={setType}
      tags={tags}
      onTagsChange={setTags}
      linkUrl={linkUrl}
      onLinkUrlChange={setLinkUrl}
      scheduledAt={scheduledAt}
      onScheduledAtChange={setScheduledAt}
      scheduledAtMin={toDatetimeLocalValue(new Date())}
      published={published}
      onPublishedChange={setPublished}
      notifySubscribersOnPublish={notifySubscribersOnPublish}
      onNotifySubscribersOnPublishChange={setNotifySubscribersOnPublish}
      pinned={pinned}
      onPinnedChange={setPinned}
    />
  );

  const topBar = (
    <EditorTopBar
      backHref="/dashboard/posts"
      backLabel={t(locale, "editor.backPosts")}
      saveState={saveUiState}
      savedAt={savedAt}
      onOpenMetadata={() => setMetadataOpen(true)}
      showMetadataButton
      onSave={() => void save(false)}
      saving={saving}
      publishLabel={
        initial?.published
          ? t(locale, "editor.update")
          : t(locale, "editor.publish")
      }
      onPublish={async () => {
        const ok = await save(false, { published: true });
        if (ok) router.push("/dashboard/posts");
      }}
      extraActions={
        initial ? (
          <EditorMoreMenu>
            {initial.published && initial.slug ? (
              <>
                <Link
                  href={`/posts/${initial.slug}`}
                  className="block rounded-md px-2 py-1.5 text-[var(--bb-text)] hover:bg-[var(--bb-surface-soft)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(locale, "editor.viewLive")}
                </Link>
                <div className="my-1 border-t border-[var(--bb-border)]" />
              </>
            ) : null}
            <PostDeleteButton
              postId={initial.id}
              postTitle={initial.title}
              redirectTo="/dashboard/posts"
              label={t(locale, "editor.deletePost")}
              variant="ghost"
              fullWidth
              className="h-auto px-2 py-1.5 text-left"
            />
          </EditorMoreMenu>
        ) : null
      }
    />
  );

  const canvas = (
    <>
      {err ? (
        <p className="mb-6 text-sm text-[var(--bb-danger)]">{err}</p>
      ) : null}
      <input
        aria-label={t(locale, "editor.titlePlaceholder")}
        placeholder={t(locale, "editor.titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-1 w-full border-none bg-transparent px-0 py-1 text-[2.15rem] font-[family-name:var(--bb-font-heading)] font-medium leading-[1.15] tracking-tight text-[var(--bb-heading)] shadow-none placeholder:text-[var(--bb-text-muted)]/55 focus:outline-none focus:ring-0 sm:text-[2.5rem]"
      />
      <textarea
        aria-label={t(locale, "editor.excerptPlaceholder")}
        placeholder={t(locale, "editor.excerptPlaceholder")}
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        maxLength={300}
        rows={2}
        className="mb-8 w-full resize-y border-none bg-transparent px-0 py-1 text-[0.95rem] leading-relaxed text-[var(--bb-text-muted)] shadow-none placeholder:text-[var(--bb-text-muted)]/45 focus:outline-none focus:ring-0"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--bb-text-muted)]">
          {t(locale, "editor.formatLabel")}
        </span>
        <div className="inline-flex rounded-full border border-[var(--bb-border)] bg-[var(--bb-surface)] p-1">
          {([
            ["RICH_TEXT", t(locale, "editor.formatRichText")],
            ["MARKDOWN", t(locale, "editor.formatMarkdown")],
          ] as const).map(([value, label]) => {
            const active = contentFormat === value;
            const disabled = !bodyIsEmpty && !active;

            return (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={active ? "default" : "ghost"}
                className="rounded-full px-3"
                disabled={disabled}
                onClick={() => {
                  if (!bodyIsEmpty || contentFormat === value) return;
                  setContentFormat(value);
                  setContent(value === "MARKDOWN" ? "" : "<p></p>");
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>
      {!bodyIsEmpty ? (
        <p className="mb-6 text-xs text-[var(--bb-text-muted)]">
          {t(locale, "editor.formatSwitchLocked")}
        </p>
      ) : null}
      {contentFormat === "MARKDOWN" ? (
        <PostMarkdownEditor
          content={content}
          onChange={setContent}
          placeholder={t(locale, "editor.contentPlaceholder")}
        />
      ) : (
        <TiptapEditor
          content={content}
          onChange={setContent}
          showFloatingMenu={false}
          showSlashMenu
        />
      )}
    </>
  );

  return (
    <EditorShell
      topBar={topBar}
      canvas={canvas}
      metadataPanel={metadataPanel}
      metadataMobileOpen={metadataOpen}
      onMetadataMobileClose={() => setMetadataOpen(false)}
    />
  );
}
