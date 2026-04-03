import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

/** Cmd/Ctrl+K — prompt URL, matches common editor UX. */
const LinkKeyboard = Extension.create({
  name: "bananyLinkKeyboard",
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        const { editor } = this;
        const prev = (editor.getAttributes("link").href as string) || "";
        const url = window.prompt("URL", prev || "https://");
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

export function getBananyEditorExtensions(placeholder = "Tell your story…") {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: {
        HTMLAttributes: { class: "bb-editor-blockquote" },
      },
      codeBlock: {
        HTMLAttributes: { class: "bb-editor-code-block" },
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { class: "bb-editor-link" },
    }),
    LinkKeyboard,
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: "bb-editor-image" },
    }),
  ];
}
