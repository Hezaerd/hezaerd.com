import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { HeroButtons } from "@/components/ui/hero-buttons";
import { personalInfo } from "@/data/personal-info";
import { SECTION_IDS } from "@/lib/sections";

export function Hero() {
	return (
		<section
			id={SECTION_IDS.home}
			className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
		>
			<div className="max-w-7xl mx-auto text-center">
				<AnimatedFadeIn className="text-4xl sm:text-6xl font-bold text-foreground mb-2">
					{personalInfo.name}
				</AnimatedFadeIn>
				<AnimatedFadeIn
					className="text-xl sm:text-2xl font-semibold text-primary mb-6 tracking-widest uppercase"
					delay={0.1}
				>
					{personalInfo.role}
				</AnimatedFadeIn>
				<AnimatedFadeIn
					className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
					delay={0.2}
				>
					{personalInfo.bio}
				</AnimatedFadeIn>
				<AnimatedFadeIn
					className="flex flex-col sm:flex-row gap-4 justify-center"
					delay={0.3}
				>
					<HeroButtons />
				</AnimatedFadeIn>
			</div>
		</section>
	);
}
