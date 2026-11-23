import { site } from "@/data/site";

const image = new URL("/og.png", site.url).href;
const imageAlt = "Hezaerd's avatar: a white-haired figure with a bird across the eyes, in grainy monochrome on black.";

export function seo({
  title = site.title,
  description = site.description,
  path,
}: {
  title?: string;
  description?: string;
  path: string;
}) {
  const url = new URL(path, site.url).href;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
