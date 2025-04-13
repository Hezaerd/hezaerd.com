import type { Metadata } from "next/types";

export const baseUrl = "https://hezaerd.com";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    authors: [
      {
        name: "Hezaerd",
      },
    ],
    openGraph: {
      siteName: "Hezaerd",
      type: "website",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: baseUrl,
      images: [
        {
          alt: "Hezaerd",
          url: "https://github.com/hezaerd.png",
          width: 1200,
          height: 630,
        },
      ],
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: [
        {
          alt: "Hezaerd",
          url: "https://github.com/hezaerd.png",
          width: 1200,
          height: 630,
        },
      ],
      ...override.twitter,
    },
    metadataBase: new URL(baseUrl),
  };
}
