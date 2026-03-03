import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/write", "/bookmarks", "/auth/"],
      },
    ],
    sitemap: "https://neuralpress.dev/sitemap.xml",
    host: "https://neuralpress.dev",
  };
}
