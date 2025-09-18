"use client";

import Image, { type ImageProps } from "next/image";
import type React from "react";
import { cloneElement, type ReactElement, useState } from "react";

// Import the cn function
import { cn } from "@/lib/utils";

export interface HoverVideoProps {
	image: ReactElement<ImageProps>;
	video: ReactElement<React.VideoHTMLAttributes<HTMLVideoElement>>;
	className?: string;
}

export function HoverVideo({ image, video, className }: HoverVideoProps) {
	const [isHovering, setIsHovering] = useState(false);

	// Extract width and height from the image props
	const { width, height } = image.props;

	const imageElement = cloneElement(image, {
		className: cn(
			"w-full h-full object-cover transition-opacity duration-300",
			isHovering ? "opacity-0" : "opacity-100",
			image.props.className,
		),
	});

	const videoElement = cloneElement(video, {
		className: cn(
			"absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300",
			isHovering ? "opacity-100" : "opacity-0",
			video.props.className,
		),
		width: width,
		height: height,
		loop: true,
		muted: true,
		playsInline: true,
		onMouseEnter: (e: any) => e.currentTarget.play(),
		onMouseLeave: (e: any) => {
			e.currentTarget.pause();
			e.currentTarget.currentTime = 0;
		},
	});

	return (
        // biome-ignore lint/a11y/noStaticElementInteractions: i want to use onMouseEnter and onMouseLeave
		<div
			className={cn("relative overflow-hidden rounded-lg", className)}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
				aspectRatio: `${width} / ${height}`,
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			{imageElement}
			{videoElement}
		</div>
	);
}
