"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { useCallback } from "react";
import { getBananyEditorExtensions } from "@/components/editor/banany-editor-extensions";
import { EditorBubbleMenu } from "@/components/editor/editor-bubble-menu";
import { EditorCodeBlockMenu } from "@/components/editor/editor-code-block-menu";
import { EditorFloatingMenu } from "@/components/editor/editor-floating-menu";
import { EditorSlashMenu } from "@/components/editor/editor-slash-menu";
import { pickAndUploadImage } from "@/components/editor/upload-image";
import { useCurrentLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

export function TiptapEditor({
  content,
  onChange,
  placeholder,
  allowImages = true,
  showFloatingMenu = true,
  showSlashMenu = false,
  showCodeBlockMenu = true,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  allowImages?: boolean;
  showFloatingMenu?: boolean;
  showSlashMenu?: boolean;
  showCodeBlockMenu?: boolean;
}) {
  const locale = useCurrentLocale();

  const insertImage = useCallback(async (ed: Editor) => {
    const uploaded = await pickAndUploadImage();
    if (!uploaded) return;

    ed.chain().focus().setImage({ src: uploaded.url }).run();
  }, []);

  const editor = useEditor({
    extensions: getBananyEditorExtensions(
      placeholder ?? t(locale, "editor.contentPlaceholder"),
      {
        allowImages,
        linkPromptLabel: t(locale, "editor.linkPrompt"),
      },
    ),
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "bb-editor-root min-h-[min(60vh,520px)] max-w-none px-0 py-1 text-[1.0625rem] leading-[1.75] text-[var(--bb-text)] antialiased focus:outline-none " +
          "prose-headings:font-[family-name:var(--bb-font-heading)] prose-headings:font-medium prose-headings:tracking-tight " +
          "prose-p:my-[0.65em] prose-li:my-1 prose-ul:my-3 prose-ol:my-3",
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  const onInsertImage = useCallback(() => {
    if (editor) insertImage(editor);
  }, [editor, insertImage]);

  if (!editor) {
    return (
      <div className="min-h-[min(60vh,520px)] animate-pulse rounded-sm bg-[var(--bb-surface-soft)]/50" />
    );
  }

  return (
    <div className="relative">
      <EditorBubbleMenu editor={editor} />
      {showCodeBlockMenu ? <EditorCodeBlockMenu editor={editor} /> : null}
      {showFloatingMenu ? (
        <EditorFloatingMenu
          editor={editor}
          onInsertImage={onInsertImage}
          allowImages={allowImages}
        />
      ) : null}
      {showSlashMenu ? (
        <EditorSlashMenu
          editor={editor}
          onInsertImage={onInsertImage}
          allowImages={allowImages}
        />
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
