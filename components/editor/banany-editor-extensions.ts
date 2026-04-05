import { Extension, type AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { lowlight } from "@/lib/code-languages";

/** Cmd/Ctrl+K — prompt URL, matches common editor UX. */
function createLinkKeyboard(linkPromptLabel: string) {
  return Extension.create({
    name: "bananyLinkKeyboard",
    addKeyboardShortcuts() {
      return {
        "Mod-k": () => {
          const { editor } = this;
          const prev = (editor.getAttributes("link").href as string) || "";
          const url = window.prompt(linkPromptLabel, prev || "https://");
          if (url === null) return true;
          const trimmed = url.trim();
          if (trimmed === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
          } else {
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: trimmed })
              .run();
          }
          return true;
        },
      };
    },
  });
}

export function getBananyEditorExtensions(
  placeholder: string,
  options?: { allowImages?: boolean; linkPromptLabel?: string },
) {
  const allowImages = options?.allowImages ?? true;
  const linkPromptLabel = options?.linkPromptLabel ?? "URL";

  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: false,
      blockquote: {
        HTMLAttributes: { class: "bb-editor-blockquote" },
      },
    }),
    CodeBlockLowlight.configure({
      lowlight,
      languageClassPrefix: "language-",
      HTMLAttributes: {
        class: "bb-editor-code-block hljs",
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { class: "bb-editor-link" },
    }),
    createLinkKeyboard(linkPromptLabel),
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }),
  ];

  if (allowImages) {
    extensions.push(
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "bb-editor-image" },
      }),
    );
  }

  return extensions;
}
