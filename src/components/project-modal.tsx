"use client";

import {
	AlertTriangle,
	CheckCircle,
	Clock,
	ExternalLink,
	Github,
	User,
	Users,
	Wrench,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/data/projects";

interface ProjectModalProps {
	project: Project;
	isOpen: boolean;
	onClose: () => void;
	initialVideoTime?: number;
}

export function ProjectModal({ project, isOpen, onClose, initialVideoTime = 0 }: ProjectModalProps) {
	const handleSourcesClick = () => {
		if (project.sourcesUrl) {
			window.open(project.sourcesUrl, "_blank");
		}
	};

	const handleReleaseClick = () => {
		if (project.releaseUrl) {
			window.open(project.releaseUrl, "_blank");
		}
	};

	const handleVideoLoad = (videoElement: HTMLVideoElement) => {
		if (initialVideoTime && initialVideoTime > 0) {
			videoElement.currentTime = initialVideoTime;
		}
	};
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
				{/* Media Banner - Notion-style at the very top */}
				<div className="relative w-full h-64 md:h-80 bg-secondary/30 overflow-hidden">
					{project.previewVideo ? (
						<video
							className="w-full h-full object-cover"
							autoPlay
							loop
							muted
							playsInline
							onLoadedData={(e) => handleVideoLoad(e.currentTarget)}
						>
							<source src={project.previewVideo} type="video/mp4" />
							<source src={project.previewVideo} type="video/webm" />
							{/* Fallback to image if video fails */}
							{project.previewImage && (
								<Image
									src={project.previewImage}
									alt={project.title}
									fill
									className="object-cover"
								/>
							)}
						</video>
					) : project.previewImage ? (
						<Image
							src={project.previewImage}
							alt={project.title}
							fill
							className="object-cover"
							priority
						/>
					) : project.highlight ? (
						<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
							<h2 className="text-3xl md:text-4xl font-bold text-primary text-center px-4">
								{project.highlight}
							</h2>
						</div>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-secondary/50">
							<Wrench className="w-16 h-16 text-muted-foreground" />
						</div>
					)}
				</div>

				{/* Content with padding */}
				<div className="p-6">
					<DialogHeader className="mb-6">
						<DialogTitle className="text-2xl font-bold flex items-center gap-2">
							<Wrench className="w-6 h-6 text-primary" />
							{project.title}
						</DialogTitle>
						<DialogDescription className="text-base">
							{project.longDescription || project.description}
						</DialogDescription>
					</DialogHeader>

				<div className="space-y-6">
					{/* Project Details Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{project.duration && (
							<div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
								<Clock className="w-4 h-4 text-primary" />
								<div>
									<div className="text-sm font-medium">Duration</div>
									<div className="text-sm text-muted-foreground">
										{project.duration}
									</div>
								</div>
							</div>
						)}
						{project.teamSize && (
							<div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
								<Users className="w-4 h-4 text-primary" />
								<div>
									<div className="text-sm font-medium">Team Size</div>
									<div className="text-sm text-muted-foreground">
										{project.teamSize}
									</div>
								</div>
							</div>
						)}
						{project.role && (
							<div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
								<User className="w-4 h-4 text-primary" />
								<div>
									<div className="text-sm font-medium">My Role</div>
									<div className="text-sm text-muted-foreground">
										{project.role}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					{(project.sourcesUrl || project.releaseUrl) && (
						<div className="flex gap-3">
							{project.sourcesUrl && (
								<Button
									variant="outline"
									size="sm"
									className="flex items-center gap-2"
									onClick={handleSourcesClick}
								>
									<Github className="w-4 h-4" />
									View Sources
								</Button>
							)}
							{project.releaseUrl && (
								<Button
									size="sm"
									className="flex items-center gap-2"
									onClick={handleReleaseClick}
								>
									<ExternalLink className="w-4 h-4" />
									Play
								</Button>
							)}
						</div>
					)}

					{/* Technologies */}
					{project.technologies && project.technologies.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
								<Wrench className="w-5 h-5 text-primary" />
								Technologies & Tools
							</h3>
							<div className="flex flex-wrap gap-2">
								{project.technologies.map((tech) => (
									<span
										key={tech}
										className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
									>
										{tech}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Features & Challenges */}
					{((project.features && project.features.length > 0) ||
						(project.challenges && project.challenges.length > 0)) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Features */}
							{project.features && project.features.length > 0 && (
								<div>
									<h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
										<CheckCircle className="w-5 h-5 text-primary" />
										Key Features
									</h3>
									<ul className="space-y-2">
										{project.features.map((feature) => (
											<li key={feature} className="flex items-start gap-2">
												<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
												<span className="text-sm">{feature}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Challenges */}
							{project.challenges && project.challenges.length > 0 && (
								<div>
									<h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
										<AlertTriangle className="w-5 h-5 text-primary" />
										Technical Challenges & Solutions
									</h3>
									<ul className="space-y-2">
										{project.challenges.map((challenge) => (
											<li key={challenge} className="flex items-start gap-2">
												<AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
												<span className="text-sm">{challenge}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}

					{/* Tags */}
					<div>
						<h3 className="text-lg font-semibold mb-3">Tags</h3>
						<div className="flex flex-wrap gap-2">
							{project.tags.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
