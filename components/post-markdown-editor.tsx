"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { pickAndUploadImage } from "@/components/editor/upload-image";
import { Button } from "@/components/ui/button";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

function imageAltFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

export function PostMarkdownEditor({
  content,
  onChange,
  placeholder,
  allowImages = true,
}: {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  allowImages?: boolean;
}) {
  const locale = useCurrentLocale();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [uploading, setUploading] = useState(false);

  function insertAtCursor(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(content + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent =
      content.slice(0, start) + snippet + content.slice(end);

    onChange(nextContent);

    requestAnimationFrame(() => {
      const nextCaret = start + snippet.length;
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  }

  async function handleInsertImage() {
    setUploading(true);
    try {
      const uploaded = await pickAndUploadImage();
      if (!uploaded) return;

      const alt = imageAltFromFileName(uploaded.fileName);
      const needsSpacing =
        content.length > 0 && !content.endsWith("\n") ? "\n\n" : "";
      insertAtCursor(`${needsSpacing}![${alt}](${uploaded.url})`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="overflow-hidden rounded-xl border border-[var(--bb-border)] bg-[var(--bb-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--bb-border)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--bb-text-muted)]">
            {t(locale, "editor.markdownInput")}
          </p>
          {allowImages ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-2 px-2 text-xs"
              onClick={() => void handleInsertImage()}
              disabled={uploading}
            >
              <ImageIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
              {uploading
                ? t(locale, "appearance.upload")
                : t(locale, "editor.insertImage")}
            </Button>
          ) : null}
        </div>
        <textarea
          ref={textareaRef}
          aria-label={t(locale, "editor.markdownInput")}
          value={content}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="min-h-[min(60vh,520px)] w-full resize-y border-none bg-transparent px-4 py-4 font-[family-name:var(--bb-font-mono)] text-[0.95rem] leading-7 text-[var(--bb-text)] outline-none placeholder:text-[var(--bb-text-muted)]/45"
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--bb-border)] bg-[var(--bb-surface)]">
        <div className="border-b border-[var(--bb-border)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--bb-text-muted)]">
            {t(locale, "editor.markdownPreview")}
          </p>
        </div>
        <div className="min-h-[min(60vh,520px)] px-4 py-4">
          {content.trim() ? (
            <MarkdownContent content={content} />
          ) : (
            <p className="text-sm text-[var(--bb-text-muted)]/75">
              {placeholder}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
