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
				<div className="text-4xl sm:text-6xl font-bold text-foreground mb-2">
					{personalInfo.name}
				</div>
				<div className="text-xl sm:text-2xl font-semibold text-primary mb-6 tracking-widest uppercase">
					{personalInfo.role}
				</div>
				<div className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
					{personalInfo.bio}
				</div>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<HeroButtons />
				</div>
			</div>
		</section>
	);
}
