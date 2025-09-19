"use client";

import { Copy, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { generateOGImageUrl } from "@/lib/og-utils";

export default function OGPreviewPage() {
	const [title, setTitle] = useState("Software Engineer");
	const [description, setDescription] = useState(
		"Crafting high-performance web experiences with precision.",
	);
	const [imageUrl, setImageUrl] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [copySuccess, setCopySuccess] = useState(false);
	const titleId = useId();
	const descriptionId = useId();

	useEffect(() => {
		const url = generateOGImageUrl({ title, description });
		setImageUrl(url);
	}, [title, description]);

	const handleImageLoad = () => {
		setIsLoading(false);
	};

	const handleImageError = () => {
		setIsLoading(false);
	};

	const refreshImage = () => {
		setIsLoading(true);
		const url = generateOGImageUrl({ title, description });
		const separator = url.includes("?") ? "&" : "?";
		setImageUrl(`${url}${separator}t=${Date.now()}`);
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(imageUrl);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	};

	const resetToDefaults = () => {
		setTitle("Software Engineer");
		setDescription("Crafting high-performance web experiences with precision.");
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">
						OG Image Preview
					</h1>
					<p className="text-muted-foreground">
						Preview and customize your Open Graph image with live updates
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Live Preview</CardTitle>
										<CardDescription>
											1200 x 630 pixels • Open Graph format
										</CardDescription>
									</div>
									<Button
										onClick={refreshImage}
										variant="outline"
										size="sm"
										disabled={isLoading}
									>
										<RefreshCw
											className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
										/>
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="relative w-full aspect-[1200/630] bg-muted rounded-lg overflow-hidden border">
									{isLoading && (
										<div className="absolute inset-0 flex items-center justify-center z-10">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
										</div>
									)}
									{imageUrl && (
										<Image
											src={imageUrl}
											alt="Open Graph preview for social media sharing"
											width={1200}
											height={630}
											className="w-full h-full object-cover"
											onLoad={handleImageLoad}
											onError={handleImageError}
											style={{ display: isLoading ? "none" : "block" }}
											unoptimized
											priority
										/>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Generated URL</CardTitle>
								<CardDescription>
									Use this URL for social media previews
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
											{imageUrl}
										</code>
										<Button
											onClick={copyToClipboard}
											variant="outline"
											size="sm"
											className="shrink-0"
										>
											<Copy className="h-4 w-4" />
											{copySuccess ? "Copied!" : "Copy"}
										</Button>
									</div>
									<div className="text-xs text-muted-foreground">
										Dimensions: 1200 x 630 • Format: PNG • Type: Open Graph
										Image
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Customize Content</CardTitle>
								<CardDescription>
									Modify the title and description to see live changes
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label
										htmlFor={titleId}
										className="block text-sm font-medium mb-1"
									>
										Title
									</label>
									<input
										id={titleId}
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
										placeholder="Enter title..."
									/>
								</div>

								<div>
									<label
										htmlFor={descriptionId}
										className="block text-sm font-medium mb-1"
									>
										Description
									</label>
									<textarea
										id={descriptionId}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={3}
										className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
										placeholder="Enter description..."
									/>
								</div>

								<div className="flex gap-2 pt-2">
									<Button
										onClick={resetToDefaults}
										variant="outline"
										className="flex-1"
									>
										Reset to Defaults
									</Button>
									<Button
										onClick={refreshImage}
										variant="default"
										className="flex-1"
									>
										Refresh Preview
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
