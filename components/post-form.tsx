"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Post, PostType } from "@prisma/client";
import { TiptapEditor } from "@/components/tiptap-editor";
import { EditorShell } from "@/components/editor/editor-shell";
import {
  EditorTopBar,
  EditorMoreMenu,
} from "@/components/editor/editor-top-bar";
import { PostMetadataPanel } from "@/components/editor/post-metadata-panel";
import { PostDeleteButton } from "@/components/post-delete-button";
import type { SaveUiState } from "@/components/editor/save-state-indicator";
import { finalizeExcerptForStorage } from "@/lib/excerpt-plain";
import { toast } from "sonner";

function toDatetimeLocalValue(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function hasEditorBody(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, "").trim();
  if (text.length > 0) return true;
  return /<(img|video|iframe|figure|hr)\b/i.test(html);
}

export function PostForm({ initial }: { initial?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "<p></p>");
  const [type, setType] = useState<PostType>(initial?.type ?? "POST");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
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
      type,
      tags: tagList,
      linkUrl: linkUrl.trim() || null,
      excerpt: finalizeExcerptForStorage(excerpt),
      published,
      pinned,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    };
  }, [
    title,
    content,
    type,
    tags,
    linkUrl,
    excerpt,
    published,
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
      if (!initial && !hasEditorBody(content)) {
        if (!silent) {
          setErr("Add text or an image before saving.");
          toast.error("Add text or an image before saving.");
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
          throw new Error(d.error || "Save failed");
        }
        const saved = (await res.json()) as Post;
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
              initial?.published ? "Post updated." : "Post published.",
            );
          } else {
            toast.success("Post saved.");
          }
        }
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Save failed";
        setErr(message);
        if (!silent) toast.error(message);
        return false;
      } finally {
        if (!silent) setSaving(false);
      }
    },
    [initial, payload, router, content],
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
      pinned={pinned}
      onPinnedChange={setPinned}
    />
  );

  const topBar = (
    <EditorTopBar
      backHref="/dashboard/posts"
      backLabel="← Posts"
      saveState={saveUiState}
      savedAt={savedAt}
      onOpenMetadata={() => setMetadataOpen(true)}
      showMetadataButton
      onSave={() => void save(false)}
      saving={saving}
      publishLabel={initial?.published ? "Update" : "Publish"}
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
                  View live
                </Link>
                <div className="my-1 border-t border-[var(--bb-border)]" />
              </>
            ) : null}
            <PostDeleteButton
              postId={initial.id}
              postTitle={initial.title}
              redirectTo="/dashboard/posts"
              label="Delete post"
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
        aria-label="Title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-1 w-full border-none bg-transparent px-0 py-1 text-[2.15rem] font-[family-name:var(--bb-font-heading)] font-medium leading-[1.15] tracking-tight text-[var(--bb-heading)] shadow-none placeholder:text-[var(--bb-text-muted)]/55 focus:outline-none focus:ring-0 sm:text-[2.5rem]"
      />
      <textarea
        aria-label="Excerpt"
        placeholder="Optional excerpt — plain text, max 300 characters (used for SEO description)"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        maxLength={300}
        rows={2}
        className="mb-8 w-full resize-y border-none bg-transparent px-0 py-1 text-[0.95rem] leading-relaxed text-[var(--bb-text-muted)] shadow-none placeholder:text-[var(--bb-text-muted)]/45 focus:outline-none focus:ring-0"
      />
      <TiptapEditor content={content} onChange={setContent} />
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
