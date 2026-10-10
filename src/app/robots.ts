import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/tutor", "/parent", "/learner", "/messages", "/settings", "/dashboard"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
