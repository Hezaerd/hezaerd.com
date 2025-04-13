import { resolve } from "node:path";
import { MetadataRoute } from "next";
import { baseUrl } from "@/lib/metadata";

export default function Sitemap(): MetadataRoute.Sitemap {
  const getUrl = (v: string) => resolve(baseUrl, v);

  return [
    {
      url: getUrl("/"),
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: getUrl("/stats"),
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.2,
    },
    {
      url: getUrl("/projects"),
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
