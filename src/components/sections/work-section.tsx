import { forwardRef } from "react";
import { SECTION_IDS } from "@/data/constants";
import { education, workExperience } from "@/data/experience";

const WorkSection = forwardRef<HTMLElement>((_, ref) => {
	return (
		<section
			id={SECTION_IDS.WORK}
			ref={ref}
			className="min-h-screen py-20 sm:py-32 opacity-0"
		>
			<div className="space-y-12 sm:space-y-16">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
					<h2 className="text-3xl sm:text-4xl font-light">
						Experience & Education
					</h2>
					<div className="text-sm text-muted-foreground font-mono">
						2021 — 2025
					</div>
				</div>

				<div className="space-y-8 sm:space-y-12">
					{/* Work Experience */}
					{workExperience.map((job) => (
						<div
							key={`${job.company}-${job.period}`}
							className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
						>
							<div className="lg:col-span-2">
								<div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
									{job.period.split("(")[0].trim()}
								</div>
							</div>
							<div className="lg:col-span-6 space-y-3">
								<div>
									<h3 className="text-lg sm:text-xl font-medium">
										{job.title}
									</h3>
									<div className="text-muted-foreground">@ {job.company}</div>
								</div>
								<p className="text-muted-foreground leading-relaxed max-w-lg">
									{job.description}
								</p>
							</div>
						</div>
					))}

					{/* Education */}
					{education.map((edu) => (
						<div
							key={`${edu.school}-${edu.period}`}
							className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
						>
							<div className="lg:col-span-2">
								<div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
									{edu.period}
								</div>
							</div>
							<div className="lg:col-span-6 space-y-3">
								<div>
									<h3 className="text-lg sm:text-xl font-medium">
										{edu.degree}
									</h3>
									<div className="text-muted-foreground">{edu.school}</div>
								</div>
								{edu.description && (
									<p className="text-muted-foreground leading-relaxed max-w-lg">
										{edu.description}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
});

WorkSection.displayName = "WorkSection";

export { WorkSection };
