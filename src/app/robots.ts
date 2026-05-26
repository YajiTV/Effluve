import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/compte/",
          "/api/",
          "/commande/",
          "/panier",
          // Routes anglaises doublons (évite le duplicate content)
          "/account/",
          "/cart/",
          "/checkout/",
          "/products/",
          // Pages auth (aucune valeur SEO)
          "/connexion/",
          "/inscription/",
          "/reinitialisation/",
        ],
      },
    ],
    sitemap: "https://effluve.fr/sitemap.xml",
  };
}
