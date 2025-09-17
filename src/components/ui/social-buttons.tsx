"use client";

import { ExternalLink, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialButtonsProps {
	github: string;
	linkedin: string;
	twitter?: string;
	email: string;
	website?: string;
}

export function SocialButtons({ github, linkedin, twitter, email, website }: SocialButtonsProps) {
	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => {
					window.open(github, "_blank");
				}}
				className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
			>
				<Github className="w-5 h-5" />
				<span className="sr-only">GitHub</span>
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => {
					window.open(linkedin, "_blank");
				}}
				className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
			>
				<Linkedin className="w-5 h-5" />
				<span className="sr-only">LinkedIn</span>
			</Button>
			{twitter && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						window.open(twitter, "_blank");
					}}
					className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
				>
					<Twitter className="w-5 h-5" />
					<span className="sr-only">Twitter</span>
				</Button>
			)}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => {
					window.open(`mailto:${email}`, "_blank");
				}}
				className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
			>
				<Mail className="w-5 h-5" />
				<span className="sr-only">Email</span>
			</Button>
			{website && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						window.open(website, "_blank");
					}}
					className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
				>
					<ExternalLink className="w-5 h-5" />
					<span className="sr-only">Website</span>
				</Button>
			)}
		</>
	);
}
