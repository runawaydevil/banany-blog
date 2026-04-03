"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { useCallback } from "react";
import { getBananyEditorExtensions } from "@/components/editor/banany-editor-extensions";
import { EditorBubbleMenu } from "@/components/editor/editor-bubble-menu";
import { EditorFloatingMenu } from "@/components/editor/editor-floating-menu";

export function TiptapEditor({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const insertImage = useCallback((ed: Editor) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prefix", "uploads");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) return;
      const data = (await res.json()) as { url: string };
      ed.chain().focus().setImage({ src: data.url }).run();
    };
    input.click();
  }, []);

  const editor = useEditor({
    extensions: getBananyEditorExtensions(placeholder ?? "Tell your story…"),
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
      <EditorFloatingMenu editor={editor} onInsertImage={onInsertImage} />
      <EditorContent editor={editor} />
    </div>
  );
}
