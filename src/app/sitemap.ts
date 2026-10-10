import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const routes = ["", "/about", "/pricing", "/tutors", "/book-trial", "/become-a-tutor", "/contact", "/faq", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.7 : 1,
  }));
}
