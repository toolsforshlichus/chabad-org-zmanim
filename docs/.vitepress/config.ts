import { defineConfig } from "vitepress";

export default defineConfig({
  title: "chabad-org-zmanim",
  description:
    "Zero-dependency TypeScript client for the Chabad.org Zmanim API",
  base: "/chabad-org-zmanim/",
  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },
  head: [
    ["meta", { name: "theme-color", content: "#1a56db" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Zero-dependency TypeScript client for fetching halachic times from Chabad.org",
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API Reference", link: "/api/functions" },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/chabad-org-zmanim",
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Fetching Zmanim", link: "/guide/fetching" },
          { text: "Error Handling", link: "/guide/errors" },
          { text: "Browser Usage", link: "/guide/browser" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "Functions", link: "/api/functions" },
          { text: "Types", link: "/api/types" },
          { text: "Errors", link: "/api/errors" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/toolsforshlichus/chabad-org-zmanim",
      },
    ],
    footer: {
      message:
        "Unofficial client. Not affiliated with or endorsed by Chabad.org.",
      copyright: "MIT License",
    },
    search: {
      provider: "local",
    },
  },
});
