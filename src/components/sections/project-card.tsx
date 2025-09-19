"use client";

import { FolderGit2, Mail, User, Wrench } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ProjectCardProps {
	project: {
		title: string;
		description: string;
		tags: string[];
		highlight?: string;
		previewImage?: string;
		previewVideo?: string;
	};
	index: number;
	onClick: (videoCurrentTime?: number) => void;
	onHover?: () => void;
	onLeave?: () => void;
}

export function ProjectCard({
	project,
	index,
	onClick,
	onHover,
	onLeave,
}: ProjectCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const handleMouseEnter = () => {
		setIsHovered(true);
		if (videoRef.current && project.previewVideo) {
			videoRef.current.play().catch(console.error);
		}
		onHover?.();
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
		if (videoRef.current && project.previewVideo) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
		onLeave?.();
	};

	const handleClick = () => {
		const videoCurrentTime = videoRef.current?.currentTime || 0;
		onClick(videoCurrentTime);
	};

	return (
		<div className="flex-[0_0_100%] min-w-0 px-2 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
			<button
				type="button"
				className="bg-card rounded-lg shadow-lg overflow-hidden border border-border cursor-pointer h-full flex flex-col hover:shadow-xl transition-shadow duration-300 text-left"
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div className="h-40 relative overflow-hidden flex-shrink-0">
					{project.previewImage ? (
						<>
							{/* Preview Image */}
							<div
								className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
									isHovered && project.previewVideo
										? "opacity-0"
										: "opacity-100"
								}`}
							>
								<Image
									src={project.previewImage}
									alt={`${project.title} preview`}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									priority={index < 3}
								/>
							</div>

							{/* Preview Video (shown on hover) */}
							{project.previewVideo && (
								<video
									ref={videoRef}
									src={project.previewVideo}
									className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
										isHovered ? "opacity-100" : "opacity-0"
									}`}
									muted
									loop
									playsInline
								/>
							)}
						</>
					) : (
						/* Fallback to original gradient design */
						<div
							className={`h-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center text-primary-foreground text-lg font-bold p-4 text-center transition-all duration-200 ${
								isHovered ? "brightness-90" : "brightness-100"
							}`}
						>
							{project.highlight || project.title}
						</div>
					)}
				</div>
				<div className="p-4 flex flex-col flex-grow min-h-0">
					<h3
						className={`text-lg font-semibold mb-2 flex items-center gap-2 flex-shrink-0 transition-colors duration-200 ${
							isHovered ? "text-primary" : "text-card-foreground"
						}`}
					>
						<FolderGit2 className="w-4 h-4 text-primary" />
						{project.title}
					</h3>
					<p className="text-muted-foreground mb-3 text-sm line-clamp-3 flex-grow">
						{project.description}
					</p>
					<div className="flex gap-1 flex-wrap mb-3 flex-shrink-0">
						{project.tags.slice(0, 3).map((tag) => (
							<span
								key={tag}
								className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center gap-1"
							>
								{tag === "C++" && <Wrench className="w-3 h-3 text-primary" />}
								{tag === "Unity" && <User className="w-3 h-3 text-primary" />}
								{tag === "AI" && <Mail className="w-3 h-3 text-primary" />}
								{tag}
							</span>
						))}
						{project.tags.length > 3 && (
							<span className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-full">
								+{project.tags.length - 3}
							</span>
						)}
					</div>
					<div className="flex-shrink-0">
						<span className="text-xs text-primary font-medium relative inline-block">
							Click to view details →
							<div
								className={`absolute bottom-0 left-0 h-0.5 bg-primary w-full transition-transform duration-300 origin-left ${
									isHovered ? "scale-x-100" : "scale-x-0"
								}`}
							/>
						</span>
					</div>
				</div>
			</button>
		</div>
	);
}
