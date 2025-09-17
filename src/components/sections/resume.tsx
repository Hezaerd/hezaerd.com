import { Briefcase, GraduationCap } from "lucide-react";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { education, workExperience } from "@/data/experience";
import { SECTION_IDS } from "@/lib/sections";

export function Resume() {
	return (
		<section
			id={SECTION_IDS.resume}
			className="py-16 px-4 sm:px-6 lg:px-8 bg-card"
		>
			<div className="max-w-7xl mx-auto">
				<AnimatedFadeIn className="text-3xl sm:text-4xl font-bold text-center text-card-foreground mb-12 flex items-center justify-center gap-2">
					<Briefcase className="w-7 h-7 text-primary" /> Experience & Education
				</AnimatedFadeIn>
				<div className="grid md:grid-cols-2 gap-12">
					<AnimatedFadeIn direction="left" delay={0.2}>
						<h3 className="text-2xl font-semibold text-card-foreground mb-6 flex items-center gap-2">
							<Briefcase className="w-5 h-5 text-primary" /> Work Experience
						</h3>
						<AnimatedFadeIn className="space-y-6" delay={0.4}>
							{workExperience.map((exp) => (
								<div
									key={exp.title}
									className={`border-l-4 border-${exp.color} pl-6`}
								>
									<h4 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
										<Briefcase className="w-4 h-4 text-primary" /> {exp.title}
									</h4>
									<p className={`text-${exp.color}`}>
										{exp.company} • {exp.period}
									</p>
									<p className="text-muted-foreground mt-2">
										{exp.description}
									</p>
								</div>
							))}
						</AnimatedFadeIn>
					</AnimatedFadeIn>
					<AnimatedFadeIn direction="right" delay={0.4}>
						<h3 className="text-2xl font-semibold text-card-foreground mb-6 flex items-center gap-2">
							<GraduationCap className="w-5 h-5 text-primary" /> Education
						</h3>
						<AnimatedFadeIn className="space-y-6" delay={0.6}>
							{education.map((edu) => (
								<div
									key={edu.degree}
									className="border-l-4 border-secondary pl-6"
								>
									<h4 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
										<GraduationCap className="w-4 h-4 text-primary" />{" "}
										{edu.degree}
									</h4>
									<p className="text-secondary-foreground">
										{edu.school} • {edu.period}
									</p>
									<p className="text-muted-foreground mt-2">
										{edu.description}
									</p>
								</div>
							))}
						</AnimatedFadeIn>
					</AnimatedFadeIn>
				</div>
			</div>
		</section>
	);
}
