"use client";

import { FolderGit2, Mail, User, Wrench } from "lucide-react";
import { motion } from "motion/react";
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
	onClick: () => void;
	onHover?: () => void;
	onLeave?: () => void;
}

export function ProjectCard({ project, index, onClick, onHover, onLeave }: ProjectCardProps) {
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

	return (
		<div className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
			<motion.div
				className="bg-card rounded-lg shadow-lg overflow-hidden border border-border cursor-pointer mx-2 h-full flex flex-col"
				onClick={onClick}
				onHoverStart={handleMouseEnter}
				onHoverEnd={handleMouseLeave}
				whileHover={{
					y: -12,
					boxShadow:
						"0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
					transition: { duration: 0.3, ease: "easeOut" },
				}}
				whileTap={{ scale: 0.98 }}
			>
				<motion.div
					className="h-40 relative overflow-hidden flex-shrink-0"
					animate={{
						scale: isHovered ? 1.05 : 1,
					}}
					transition={{ duration: 0.2 }}
				>
					{project.previewImage ? (
						<>
							{/* Preview Image */}
							<motion.div
								className="w-full h-full object-cover object-center"
								animate={{
									opacity: isHovered && project.previewVideo ? 0 : 1,
								}}
								transition={{ duration: 0.3 }}
							>
								<Image
									src={project.previewImage}
									alt={`${project.title} preview`}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									priority={index < 3}
								/>
							</motion.div>

							{/* Preview Video (shown on hover) */}
							{project.previewVideo && (
								<motion.video
									ref={videoRef}
									src={project.previewVideo}
									className="absolute inset-0 w-full h-full object-cover object-center"
									muted
									loop
									playsInline
									initial={{ opacity: 0 }}
									animate={{
										opacity: isHovered ? 1 : 0,
									}}
									transition={{ duration: 0.3 }}
								/>
							)}

							{/* Highlight overlay with low opacity on hover */}
							<motion.div
								className="absolute inset-0 bg-black/20 flex items-center justify-center"
								animate={{
									opacity: isHovered ? 0.1 : 0.3,
								}}
								transition={{ duration: 0.3 }}
							>
								<span className="text-white text-lg font-bold p-4 text-center drop-shadow-lg">
									{project.highlight || project.title}
								</span>
							</motion.div>
						</>
					) : (
						/* Fallback to original gradient design */
						<motion.div
							className="h-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center text-primary-foreground text-lg font-bold p-4 text-center"
							animate={{
								filter: isHovered ? "brightness(0.9)" : "brightness(1)",
							}}
							transition={{ duration: 0.2 }}
						>
							{project.highlight || project.title}
						</motion.div>
					)}
				</motion.div>
				<div className="p-4 flex flex-col flex-grow min-h-0">
					<motion.h3
						className="text-lg font-semibold text-card-foreground mb-2 flex items-center gap-2 flex-shrink-0"
						animate={{
							color: isHovered
								? "hsl(var(--primary))"
								: "hsl(var(--card-foreground))",
						}}
						transition={{ duration: 0.2 }}
					>
						<FolderGit2 className="w-4 h-4 text-primary" />
						{project.title}
					</motion.h3>
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
							<motion.div
								className="absolute bottom-0 left-0 h-0.5 bg-primary w-full"
								animate={{
									scaleX: isHovered ? 1 : 0,
								}}
								style={{ originX: 0 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
							/>
						</span>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
