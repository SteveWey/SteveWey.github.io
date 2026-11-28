import { visit } from "unist-util-visit";

/**
 * Markdown images can carry a size hint in the title:
 *
 * ![alt](./image.png "width=50%")
 *
 * Astro processes the image path, then this rehype pass turns the hint into
 * inline width/height styles. Avoids raw HTML <img> paths, which Astro does not
 * resolve from content folders.
 */
export function rehypeImageSize() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;

      const properties = node.properties || {};
      const title = properties.title;
      if (typeof title !== "string" || !title.startsWith("width=")) return;

      const value = title.slice("width=".length).trim();
      if (!/^\d+(?:\.\d+)?(?:%|px)?$/.test(value)) return;

      const width = /%|px$/.test(value) ? value : `${value}px`;
      const style = typeof properties.style === "string" ? properties.style : "";

      node.properties = {
        ...properties,
        style: `${style}${style ? ";" : ""}width:${width};height:auto;`,
      };
      delete node.properties.title;
    });
  };
}
