"use client";

import { FolderGit2, Mail, User, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface ProjectCardProps {
	project: {
		title: string;
		description: string;
		tags: string[];
		highlight?: string;
	};
	index: number;
	onClick: () => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
			<motion.div
				className="bg-card rounded-lg shadow-lg overflow-hidden border border-border cursor-pointer mx-2 h-full"
				onClick={onClick}
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
				whileHover={{
					y: -12,
					boxShadow:
						"0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
					transition: { duration: 0.3, ease: "easeOut" },
				}}
				whileTap={{ scale: 0.98 }}
			>
				<motion.div
					className="h-40 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center text-primary-foreground text-lg font-bold p-4 text-center"
					animate={{
						scale: isHovered ? 1.05 : 1,
						filter: isHovered ? "brightness(0.9)" : "brightness(1)",
					}}
					transition={{ duration: 0.2 }}
				>
					{project.highlight || project.title}
				</motion.div>
				<div className="p-4">
					<motion.h3
						className="text-lg font-semibold text-card-foreground mb-2 flex items-center gap-2"
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
					<p className="text-muted-foreground mb-3 text-sm line-clamp-3">
						{project.description}
					</p>
					<div className="flex gap-1 flex-wrap mb-3">
						{project.tags.slice(0, 3).map((tag) => (
							<span
								key={tag}
								className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center gap-1"
							>
								{tag === "C++" && (
									<Wrench className="w-3 h-3 text-primary" />
								)}
								{tag === "Unity" && (
									<User className="w-3 h-3 text-primary" />
								)}
								{tag === "AI" && (
									<Mail className="w-3 h-3 text-primary" />
								)}
								{tag}
							</span>
						))}
						{project.tags.length > 3 && (
							<span className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-full">
								+{project.tags.length - 3}
							</span>
						)}
					</div>
					<div className="text-xs text-primary font-medium relative inline-block">
						<span>Click to view details →</span>
						<motion.div
							className="absolute bottom-0 left-0 h-0.5 bg-primary w-full"
							animate={{
								scaleX: isHovered ? 1 : 0,
							}}
							style={{ originX: 0 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
