"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { CODE_LANGUAGE_OPTIONS } from "@/lib/code-languages";
import { Button } from "@/components/ui/button";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

export function EditorCodeBlockMenu({ editor }: { editor: Editor }) {
  const locale = useCurrentLocale();

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-2 rounded-lg border border-[var(--bb-border)]/80 bg-[var(--bb-surface-elevated)]/95 p-2 shadow-lg backdrop-blur-sm"
      shouldShow={({ editor: ed }) => ed.isActive("codeBlock")}
    >
      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--bb-text-muted)]">
        {t(locale, "editor.codeLanguage")}
      </label>
      <select
        value={
          ((editor.getAttributes("codeBlock").language as string | undefined) ??
            "plaintext")
        }
        onMouseDown={(event) => event.preventDefault()}
        onChange={(event) => {
          editor
            .chain()
            .focus()
            .updateAttributes("codeBlock", {
              language: event.target.value,
            })
            .run();
        }}
        className="h-8 rounded-md border border-[var(--bb-border)] bg-[var(--bb-surface)] px-2 text-xs text-[var(--bb-text)] outline-none"
      >
        {CODE_LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.chain().focus().clearNodes().run()}
      >
        {t(locale, "editor.turnIntoParagraph")}
      </Button>
    </BubbleMenu>
  );
}
