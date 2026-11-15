import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const rawBase = process.env.BASE_PATH || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const site = process.env.SITE_URL || "https://example.com";

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [rehypeKatex, { throwOnError: false, strict: false }],
      ],
    }),
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
});
