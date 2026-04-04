"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Page } from "@prisma/client";
import { useCurrentLocale } from "@/components/locale-provider";
import { TiptapEditor } from "@/components/tiptap-editor";
import { EditorShell } from "@/components/editor/editor-shell";
import {
  EditorTopBar,
  EditorMoreMenu,
} from "@/components/editor/editor-top-bar";
import { PageMetadataPanel } from "@/components/editor/page-metadata-panel";
import type { SaveUiState } from "@/components/editor/save-state-indicator";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export function PageForm({ initial }: { initial?: Page }) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "<p></p>");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const payload = useCallback(() => {
    return {
      title: title.trim(),
      content,
      published,
    };
  }, [title, content, published]);

  const fingerprint = useMemo(() => JSON.stringify(payload()), [payload]);

  const [savedFingerprint, setSavedFingerprint] = useState(() =>
    initial ? JSON.stringify(payload()) : fingerprint,
  );

  useEffect(() => {
    if (initial?.id) {
      setSavedFingerprint(JSON.stringify(payload()));
    }
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    ) => {
      const merged = { ...payload(), ...overrides };
      if (!merged.title) return;
      setErr(null);
      if (!silent) setSaving(true);
      try {
        const url = initial ? `/api/pages/${initial.id}` : "/api/pages";
        const method = initial ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || t(locale, "editor.saveFailed"));
        }
        const page = (await res.json()) as Page;
        if (overrides?.published === true) setPublished(true);
        setSavedFingerprint(JSON.stringify(merged));
        setSavedAt(new Date());
        if (!initial) {
          router.replace(`/dashboard/pages/${page.id}`);
        }
        router.refresh();
        if (!silent) {
          if (overrides?.published === true) {
            toast.success(
              initial?.published
                ? t(locale, "editor.pageUpdated")
                : t(locale, "editor.pagePublished"),
            );
          } else {
            toast.success(t(locale, "editor.pageSaved"));
          }
        }
      } catch (e) {
        const message =
          e instanceof Error && e.message
            ? e.message
            : t(locale, "editor.saveFailed");
        setErr(message);
        if (!silent) toast.error(message);
      } finally {
        if (!silent) setSaving(false);
      }
    },
    [initial, payload, router, locale],
  );

  useEffect(() => {
    if (!initial || !isDirty) return;
    const t = setTimeout(() => {
      void save(true);
    }, 2200);
    return () => clearTimeout(t);
  }, [initial, isDirty, fingerprint, save]);

  const metadataPanel = (
    <PageMetadataPanel published={published} onPublishedChange={setPublished} />
  );

  const topBar = (
    <EditorTopBar
      backHref="/dashboard/pages"
      backLabel={t(locale, "editor.backPages")}
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
        await save(false, { published: true });
        router.push("/dashboard/pages");
      }}
      extraActions={
        initial?.published && initial.slug ? (
          <EditorMoreMenu>
            <Link
              href={`/p/${initial.slug}`}
              className="block rounded-md px-2 py-1.5 text-[var(--bb-text)] hover:bg-[var(--bb-surface-soft)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(locale, "editor.viewLive")}
            </Link>
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
        aria-label={t(locale, "editor.pageTitlePlaceholder")}
        placeholder={t(locale, "editor.pageTitlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-8 w-full border-none bg-transparent px-0 py-1 text-[2.15rem] font-[family-name:var(--bb-font-heading)] font-medium leading-[1.15] tracking-tight text-[var(--bb-heading)] shadow-none placeholder:text-[var(--bb-text-muted)]/55 focus:outline-none focus:ring-0 sm:text-[2.5rem]"
      />
      <TiptapEditor
        content={content}
        onChange={setContent}
        placeholder={t(locale, "editor.pageContentPlaceholder")}
      />
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
