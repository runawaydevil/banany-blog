"use client";

import type { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import {
  Heading2,
  Heading3,
  ImageIcon,
  Quote,
  FileCode,
  Minus,
  List,
  ListOrdered,
  Pilcrow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function FloatBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-8 w-8 shrink-0 p-0 text-[var(--bb-text-muted)] hover:text-[var(--bb-text)]"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function EditorFloatingMenu({
  editor,
  onInsertImage,
  allowImages = true,
}: {
  editor: Editor;
  onInsertImage: () => void;
  allowImages?: boolean;
}) {
  return (
    <FloatingMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-lg border border-[var(--bb-border)]/70 bg-[var(--bb-surface-elevated)]/95 p-1 shadow-md backdrop-blur-sm"
      shouldShow={({ editor: ed, state }) => {
        if (!ed.isFocused || !state.selection.empty) return false;
        const { $from } = state.selection;
        const type = $from.parent.type.name;
        if (type !== "paragraph") return false;
        if ($from.parent.content.size > 0) return false;
        if (ed.isActive("bulletList") || ed.isActive("orderedList"))
          return false;
        return true;
      }}
    >
      <FloatBtn
        title="Paragraph"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Heading 2"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Heading 3"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Code block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <FileCode className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      <FloatBtn
        title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" strokeWidth={2.25} />
      </FloatBtn>
      {allowImages ? (
        <FloatBtn title="Image" onClick={onInsertImage}>
          <ImageIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </FloatBtn>
      ) : null}
    </FloatingMenu>
  );
}
