import { absoluteOgImage, absoluteUrl, site } from "@/lib/site";

type PageHeadOptions = {
  title: string;
  description: string;
  path: string;
  /** Prefer PNG/JPG/WebP. AVIF/video fall back to the site OG image. */
  image?: string;
  type?: "website" | "article";
};

function socialShareImage(path?: string): string {
  if (!path) return absoluteOgImage();
  if (/\.(avif|webm|mp4|gif)$/i.test(path)) return absoluteOgImage();
  return absoluteOgImage(path);
}

export function pageHead({ title, description, path, image, type = "website" }: PageHeadOptions) {
  const url = absoluteUrl(path);
  const ogImage = socialShareImage(image);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: ogImage },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: site.locale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}
