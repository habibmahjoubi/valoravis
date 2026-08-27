import "server-only";
import sanitizeHtmlLib from "sanitize-html";

/**
 * Assainit le HTML fourni par l'utilisateur (templates d'emails).
 * Basé sur `sanitize-html` (parseur réel, whitelist) — remplace l'ancien
 * filtre regex par blacklist qui était contournable.
 */
export function sanitizeTemplateHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "s",
      "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote",
      "a", "span", "div", "table", "thead", "tbody", "tr", "td", "th",
      "img", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^[a-zA-Z]+$/],
        "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^[a-zA-Z]+$/],
        "text-align": [/^(left|right|center|justify)$/],
        "font-size": [/^\d+(px|em|rem|%)$/],
        "font-weight": [/^(normal|bold|\d{3})$/],
        padding: [/^[\d px%]+$/],
        margin: [/^[\d px%auto]+$/],
        "border-radius": [/^\d+(px|em|%)$/],
        display: [/^(block|inline|inline-block|none)$/],
        "max-width": [/^\d+(px|em|rem|%)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
    disallowedTagsMode: "discard",
  });
}
