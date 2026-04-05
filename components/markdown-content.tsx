import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import {
  highlightCodeToHtml,
  normalizeCodeLanguage,
} from "@/lib/code-languages";

const defaultAttributes = defaultSchema.attributes ?? {};

const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "del",
    "input",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
  ],
  attributes: {
    ...defaultAttributes,
    ul: [
      ...(defaultAttributes.ul || []),
      ["className", "contains-task-list"],
    ],
    li: [
      ...(defaultAttributes.li || []),
      ["className", "task-list-item"],
    ],
    code: [
      ...(defaultAttributes.code || []),
      ["className", /^language-[\w-]+$/, "hljs"],
    ],
    pre: [
      ...(defaultAttributes.pre || []),
      ["className", "hljs"],
    ],
    input: [
      ...(defaultAttributes.input || []),
      ["type", "checkbox"],
      "checked",
      "disabled",
    ],
    th: [...(defaultAttributes.th || []), "align"],
    td: [...(defaultAttributes.td || []), "align"],
    span: [
      ...(defaultAttributes.span || []),
      ["className", /^hljs(?:-[\w-]+)?$/],
    ],
  },
};

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const classes = ["bb-content", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema]]}
        components={{
          a: ({ href, children, ...props }) => {
            const external = Boolean(href && /^https?:\/\//.test(href));
            return (
              <a
                {...props}
                href={href}
                rel={external ? "noopener noreferrer" : props.rel}
                target={external ? "_blank" : props.target}
              >
                {children}
              </a>
            );
          },
          code: ({ className: codeClassName, children, ...props }) => {
            return (
              <code
                className={[codeClassName, !codeClassName ? "bb-inline-code" : ""]
                  .filter(Boolean)
                  .join(" ")}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            const codeNode = React.Children.only(children);

            if (!React.isValidElement(codeNode)) {
              return <pre className="bb-code-block">{children}</pre>;
            }

            const codeProps = codeNode.props as {
              children?: React.ReactNode;
              className?: string;
            };
            const match = /language-([\w-]+)/.exec(codeProps.className || "");
            const raw = String(codeProps.children ?? "").replace(/\n$/, "");
            const { html, language } = highlightCodeToHtml(
              raw,
              normalizeCodeLanguage(match?.[1]),
            );

            return (
              <pre className="bb-code-block hljs" data-language={language}>
                <code
                  className={`hljs language-${language}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </pre>
            );
          },
          img: ({ src, alt, ...props }) => {
            if (!src) return null;
            // eslint-disable-next-line @next/next/no-img-element
            return <img {...props} src={src} alt={alt || ""} loading="lazy" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
