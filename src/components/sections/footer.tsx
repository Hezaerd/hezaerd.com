import { ExternalLink } from "lucide-react";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { CurrentYear } from "@/components/ui/current-year";
import { SocialButtons } from "@/components/ui/social-buttons";
import { personalInfo } from "@/data/personal-info";

export function Footer() {
	return (
		<footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<AnimatedFadeIn className="text-center md:text-left">
						<p className="text-muted-foreground mb-2">
							© <CurrentYear /> {personalInfo.name}. All rights
							reserved.
						</p>
						<p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
							Portfolio crafted by{" "}
							<a
								href="https://hezaerd.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1 font-medium"
							>
								Hezaerd
								<ExternalLink className="w-3 h-3" />
							</a>
						</p>
					</AnimatedFadeIn>

					<AnimatedFadeIn className="flex gap-4" delay={0.1}>
						<SocialButtons />
					</AnimatedFadeIn>
				</div>
			</div>
		</footer>
	);
}
