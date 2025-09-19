import type { Metadata } from "next";
import { generateOGImageUrl, type OGImageOptions } from "@/lib/og-utils";

interface OGImageMetaProps extends OGImageOptions {
	path?: string;
}

export function generateOGMetadata({
	title,
	description,
	path = "",
}: OGImageMetaProps): Partial<Metadata> {
	const ogImageUrl = generateOGImageUrl({ title, description });
	const pageUrl = `https://hezaerd.com${path}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: pageUrl,
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: title || "Software Engineer",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImageUrl],
		},
	};
}
