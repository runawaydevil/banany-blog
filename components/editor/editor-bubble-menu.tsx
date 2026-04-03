"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Code,
  Quote,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  FileCode,
  Eraser,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function MenuBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "ghost"}
      className="h-8 w-8 shrink-0 p-0"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function EditorBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <>
      <BubbleMenu
        editor={editor}
        className="flex max-w-[min(100vw-2rem,520px)] flex-wrap items-center gap-0.5 rounded-lg border border-[var(--bb-border)]/80 bg-[var(--bb-surface-elevated)]/95 p-1 shadow-lg backdrop-blur-sm"
        shouldShow={({ editor: ed, state }) => {
          const { selection } = state;
          if (selection.empty) return false;
          if (ed.isActive("codeBlock")) return false;
          return true;
        }}
      >
        <MenuBtn
          title="Bold (⌘B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Italic (⌘I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Link (⌘K)"
          active={editor.isActive("link")}
          onClick={() => {
            const prev = (editor.getAttributes("link").href as string) || "";
            const url = window.prompt("URL", prev || "https://");
            if (url === null) return;
            const t = url.trim();
            if (t === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
            } else {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: t })
                .run();
            }
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <FileCode className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
        <MenuBtn
          title="Clear marks"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <Eraser className="h-3.5 w-3.5" strokeWidth={2.25} />
        </MenuBtn>
      </BubbleMenu>

      <BubbleMenu
        editor={editor}
        className="flex items-center gap-1 rounded-lg border border-[var(--bb-border)]/80 bg-[var(--bb-surface-elevated)]/95 p-1 shadow-lg backdrop-blur-sm"
        shouldShow={({ editor: ed }) => ed.isActive("image")}
      >
        <MenuBtn
          title="Remove image"
          onClick={() => editor.chain().focus().deleteSelection().run()}
        >
          <Trash2
            className="h-3.5 w-3.5 text-[var(--bb-danger)]"
            strokeWidth={2.25}
          />
        </MenuBtn>
      </BubbleMenu>
    </>
  );
}
