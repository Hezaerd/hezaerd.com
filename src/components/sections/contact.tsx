import { Mail } from "lucide-react";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { EmailButton } from "@/components/ui/email-button";
import { SECTION_IDS } from "@/lib/sections";

export function Contact() {
	return (
		<section
			id={SECTION_IDS.contact}
			className="py-24 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-background to-muted/20"
		>
			<div className="max-w-4xl mx-auto">
				<AnimatedFadeIn className="text-center mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
						<Mail className="w-8 h-8 text-primary" />
						Get in Touch
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						I'm actively looking for new opportunities and exciting projects.
						Feel free to reach out if you'd like to collaborate!
					</p>
				</AnimatedFadeIn>

				<AnimatedFadeIn
					className="flex justify-center"
					delay={0.2}
					distance={20}
				>
					<EmailButton
						email="hezaerd@hezaerd.com"
						className="min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4"
					/>
				</AnimatedFadeIn>
			</div>
		</section>
	);
}
