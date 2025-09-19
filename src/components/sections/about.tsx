import { User, Wrench } from "lucide-react";
import { personalInfo } from "@/data/personal-info";
import { skills } from "@/data/skills";
import { SECTION_IDS } from "@/lib/sections";

export function About() {
	return (
		<section
			id={SECTION_IDS.about}
			className="py-16 px-4 sm:px-6 lg:px-8 bg-card"
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-3xl sm:text-4xl font-bold text-center text-card-foreground mb-12 flex items-center justify-center gap-2">
					<User className="w-7 h-7 text-primary" /> About Me
				</div>
				<div className="grid md:grid-cols-2 gap-12 items-center">
					<div>
						<p className="text-lg text-muted-foreground mb-6">
							{personalInfo.bio}
						</p>
						{personalInfo.location && (
							<p className="text-lg text-muted-foreground">
								📍 Based in {personalInfo.location}
							</p>
						)}
					</div>
					<div className="bg-primary p-1 rounded-lg">
						<div className="bg-background p-8 rounded-lg">
							<h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
								<Wrench className="w-5 h-5 text-primary" /> Skills &
								Technologies
							</h3>
							<div className="grid grid-cols-2 gap-4">
								{skills.map((skill) => (
									<div
										key={skill}
										className="text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors duration-200"
									>
										<span className="w-2 h-2 rounded-full bg-primary inline-block" />
										{skill}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
