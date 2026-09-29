import sanitizeHtml from "sanitize-html";

export function sanitize(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "escape",
  }).trim();
}

export function sanitizeRich(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "code", "pre"],
    allowedAttributes: {},
  }).trim();
}
