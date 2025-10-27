import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: "https://hezaerd.com",
			changeFrequency: "yearly",
			priority: 1,
			lastModified: new Date(),
		},
		{
			url: "https://hezaerd.com/projects",
			changeFrequency: "monthly",
			priority: 0.8,
			lastModified: new Date(),
		},
		{
			url: "https://hezaerd.com/blog",
			changeFrequency: "monthly",
			priority: 0.8,
			lastModified: new Date(),
		},
	];
}
