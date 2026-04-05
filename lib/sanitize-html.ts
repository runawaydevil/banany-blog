import sanitizeHtml from "sanitize-html";

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "img",
      "figure",
      "figcaption",
      "pre",
      "span",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
      pre: ["class"],
      code: ["class"],
      span: ["class"],
      table: ["class"],
      th: ["align"],
      td: ["align"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });
}
