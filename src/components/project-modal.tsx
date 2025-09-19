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
import { FaItchIo, FaSteam } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Modrinth } from "@/components/ui/icons/modrinth";
import type { Project } from "@/data/projects";

interface ProjectModalProps {
	project: Project;
	isOpen: boolean;
	onClose: () => void;
	initialVideoTime?: number;
}

export function ProjectModal({
	project,
	isOpen,
	onClose,
	initialVideoTime = 0,
}: ProjectModalProps) {
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

	// Helper function to get better button labels based on project type
	const getButtonLabels = () => {
		const hasGitHub = project.sourcesUrl?.includes("github.com");
		const hasItch = project.releaseUrl?.includes("itch.io");
		const hasSteam = project.releaseUrl?.includes("steam");
		const hasModrinth = project.releaseUrl?.includes("modrinth.com");

		const sourceLabel = hasGitHub ? "View on GitHub" : "View Source Code";
		let releaseLabel = "View Project";
		let releaseDescription = "Visit the project page";
		let releaseIcon = <ExternalLink className="w-4 h-4" />;

		if (hasItch) {
			releaseLabel = "Play on Itch.io";
			releaseDescription = "Play the game in your browser or download";
			releaseIcon = <FaItchIo className="w-4 h-4" color="#fa5c5c" />;
		} else if (hasSteam) {
			releaseLabel = "View on Steam";
			releaseDescription = "Check out the Steam store page";
			releaseIcon = <FaSteam className="w-4 h-4" />;
		} else if (hasModrinth) {
			releaseLabel = "Download Mod";
			releaseDescription = "Get the mod from Modrinth";
			releaseIcon = <Modrinth className="w-4 h-4" color="#1bd16d"/>;
		}

		return { sourceLabel, releaseLabel, releaseDescription, releaseIcon };
	};

	const { sourceLabel, releaseLabel, releaseDescription, releaseIcon } =
		getButtonLabels();
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

					{/* Prominent Action Buttons Overlay */}
					{(project.sourcesUrl || project.releaseUrl) && (
						<div className="absolute bottom-4 right-4 flex gap-2">
							{project.releaseUrl && (
								<Button
									size="default"
									className="shadow-lg backdrop-blur-sm bg-primary/90 hover:bg-primary text-primary-foreground font-medium"
									onClick={handleReleaseClick}
								>
									<span className="mr-2">{releaseIcon}</span>
									{releaseLabel}
								</Button>
							)}
							{project.sourcesUrl && (
								<Button
									variant="secondary"
									size="default"
									className="shadow-lg backdrop-blur-sm bg-secondary/90 hover:bg-secondary/80 font-medium"
									onClick={handleSourcesClick}
								>
									<Github className="w-4 h-4 mr-2" />
									{sourceLabel}
								</Button>
							)}
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
						{/* Enhanced Action Section */}
						{(project.sourcesUrl || project.releaseUrl) && (
							<div className="bg-secondary/30 rounded-lg p-4 border border-secondary">
								<h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
									<ExternalLink className="w-5 h-5 text-primary" />
									Project Links
								</h3>
								<div className="space-y-3">
									{project.releaseUrl && (
										<div className="flex items-center justify-between p-3 bg-background rounded-lg border">
											<div className="flex-1">
												<div className="font-medium text-foreground">
													{releaseLabel}
												</div>
												<div className="text-sm text-muted-foreground">
													{releaseDescription}
												</div>
											</div>
											<Button
												size="sm"
												className="ml-3 flex items-center gap-2"
												onClick={handleReleaseClick}
											>
												{releaseIcon}
												Visit
											</Button>
										</div>
									)}
									{project.sourcesUrl && (
										<div className="flex items-center justify-between p-3 bg-background rounded-lg border">
											<div className="flex-1">
												<div className="font-medium text-foreground">
													{sourceLabel}
												</div>
												<div className="text-sm text-muted-foreground">
													Explore the source code and implementation details
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="ml-3 flex items-center gap-2"
												onClick={handleSourcesClick}
											>
												<Github className="w-4 h-4" />
												View
											</Button>
										</div>
									)}
								</div>
							</div>
						)}

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
