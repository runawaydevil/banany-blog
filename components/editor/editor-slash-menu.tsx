"use client";

import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  FileCode,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
} from "lucide-react";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

type SlashMenuState = {
  left: number;
  query: string;
  top: number;
};

type SlashMenuItem = {
  id: string;
  icon: typeof Pilcrow;
  keywords: string[];
  label: string;
  run: () => void;
};

function getSlashMenuState(editor: Editor): SlashMenuState | null {
  if (!editor.isEditable || !editor.isFocused) return null;

  const { selection } = editor.state;
  if (!selection.empty) return null;

  const { $from, from } = selection;
  if ($from.parent.type.name !== "paragraph") return null;

  const text = $from.parent.textContent;
  if (!/^\/[\w-]*$/.test(text)) return null;
  if ($from.parentOffset !== text.length) return null;

  const anchor = editor.view.coordsAtPos(from);
  const container = editor.view.dom.getBoundingClientRect();

  return {
    query: text.slice(1).toLowerCase(),
    left: anchor.left - container.left,
    top: anchor.bottom - container.top + 8,
  };
}

function clearSlashParagraph(editor: Editor) {
  const { $from } = editor.state.selection;

  return editor
    .chain()
    .focus()
    .deleteRange({ from: $from.start(), to: $from.end() })
    .run();
}

export function EditorSlashMenu({
  editor,
  onInsertImage,
  allowImages = true,
}: {
  editor: Editor;
  onInsertImage: () => void;
  allowImages?: boolean;
}) {
  const locale = useCurrentLocale();
  const [menuState, setMenuState] = useState<SlashMenuState | null>(null);

  useEffect(() => {
    const sync = () => setMenuState(getSlashMenuState(editor));

    sync();
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    editor.on("focus", sync);
    editor.on("blur", sync);

    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
      editor.off("focus", sync);
      editor.off("blur", sync);
    };
  }, [editor]);

  const items = useMemo<SlashMenuItem[]>(() => {
    const definitions: SlashMenuItem[] = [
      {
        id: "paragraph",
        icon: Pilcrow,
        keywords: ["paragraph", "text"],
        label: t(locale, "editor.slashParagraph"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().setParagraph().run();
        },
      },
      {
        id: "heading-2",
        icon: Heading2,
        keywords: ["heading", "title", "h2"],
        label: t(locale, "editor.slashHeading2"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        },
      },
      {
        id: "heading-3",
        icon: Heading3,
        keywords: ["heading", "subtitle", "h3"],
        label: t(locale, "editor.slashHeading3"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        },
      },
      {
        id: "quote",
        icon: Quote,
        keywords: ["quote", "blockquote"],
        label: t(locale, "editor.slashQuote"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().toggleBlockquote().run();
        },
      },
      {
        id: "code",
        icon: FileCode,
        keywords: ["code", "snippet"],
        label: t(locale, "editor.slashCodeBlock"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().toggleCodeBlock().run();
        },
      },
      {
        id: "divider",
        icon: Minus,
        keywords: ["divider", "separator", "rule"],
        label: t(locale, "editor.slashDivider"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().setHorizontalRule().run();
        },
      },
      {
        id: "bullet-list",
        icon: List,
        keywords: ["bullet", "list", "unordered"],
        label: t(locale, "editor.slashBulletList"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        id: "ordered-list",
        icon: ListOrdered,
        keywords: ["numbered", "list", "ordered"],
        label: t(locale, "editor.slashNumberedList"),
        run: () => {
          clearSlashParagraph(editor);
          editor.chain().focus().toggleOrderedList().run();
        },
      },
    ];

    if (allowImages) {
      definitions.push({
        id: "image",
        icon: ImageIcon,
        keywords: ["image", "photo", "media"],
        label: t(locale, "editor.slashImage"),
        run: () => {
          clearSlashParagraph(editor);
          onInsertImage();
        },
      });
    }

    const query = menuState?.query.trim();
    if (!query) return definitions;

    return definitions.filter((item) => {
      const haystack = `${item.label} ${item.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [allowImages, editor, locale, menuState?.query, onInsertImage]);

  if (!menuState || items.length === 0) return null;

  return (
    <div
      className="absolute z-20 min-w-[240px] rounded-xl border border-[var(--bb-border)] bg-[var(--bb-surface-elevated)] p-2 shadow-xl"
      style={{
        left: Math.max(0, Math.min(menuState.left, 420)),
        top: menuState.top,
      }}
    >
      <div className="mb-1 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--bb-text-muted)]">
        /
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-[var(--bb-text)] transition-colors hover:bg-[var(--bb-surface-soft)]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => item.run()}
              >
                <Icon className="h-4 w-4 text-[var(--bb-text-muted)]" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
