import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/api/", "/checkout/", "/cart"],
      },
    ],
    sitemap: "https://effluve.fr/sitemap.xml",
  };
}
