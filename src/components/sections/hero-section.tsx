import { forwardRef } from "react";
import { SECTION_IDS } from "@/data/constants";
import { workExperience } from "@/data/experience";
import { personalInfo } from "@/data/personal-info";
import { skills } from "@/data/skills";

const HeroSection = forwardRef<HTMLElement>((_, ref) => {
	const currentWork = workExperience[0];
	const keySkills = skills.slice(0, 5);

	return (
		<header
			id={SECTION_IDS.INTRO}
			ref={ref}
			className="min-h-screen flex items-center opacity-0"
		>
			<div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
				<div className="lg:col-span-3 space-y-6 sm:space-y-8">
					<div className="space-y-3 sm:space-y-2">
						<div className="text-sm text-muted-foreground font-mono tracking-wider">
							PORTFOLIO / 2025
						</div>
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
							{personalInfo.name}
						</h1>
					</div>

					<div className="space-y-6 max-w-md">
						<p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
							{personalInfo.bio}
						</p>

						<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
								Available for work
							</div>
							<div>{personalInfo.location}</div>
						</div>
					</div>
				</div>

				<div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
					<div className="space-y-4">
						<div className="text-sm text-muted-foreground font-mono">
							CURRENTLY
						</div>
						<div className="space-y-2">
							<div className="text-foreground">{currentWork.title}</div>
							<div className="text-muted-foreground">
								@ {currentWork.company}
							</div>
							<div className="text-xs text-muted-foreground">
								{currentWork.period}
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="text-sm text-muted-foreground font-mono">FOCUS</div>
						<div className="flex flex-wrap gap-2">
							{keySkills.map((skill) => (
								<span
									key={skill}
									className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
								>
									{skill}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
});

HeroSection.displayName = "HeroSection";

export { HeroSection };
