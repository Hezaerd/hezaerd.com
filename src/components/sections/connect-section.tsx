import { forwardRef } from "react"
import Link from "next/link"
import { personalInfo } from "@/data/personal-info"
import { socials } from "@/data/socials"
import { SECTION_IDS } from "@/data/constants"

const ConnectSection = forwardRef<HTMLElement>((_, ref) => {
	return (
		<section
			id={SECTION_IDS.CONNECT}
			ref={ref}
			className="py-20 sm:py-32 opacity-0"
		>
			<div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
				<div className="space-y-6 sm:space-y-8">
					<h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>

					<div className="space-y-6">
						<p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
							Interested in collaborating on exciting projects or discussing technology and game development? Feel free to reach out.
						</p>

						<div className="space-y-4">
							<Link
								href={`mailto:${personalInfo.email}`}
								className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
							>
								<span className="text-base sm:text-lg">{personalInfo.email}</span>
								<svg
									className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</Link>
						</div>
					</div>
				</div>

				<div className="space-y-6 sm:space-y-8">
					<div className="text-sm text-muted-foreground font-mono">CONNECT ON</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{socials.map((social) => {
							const Icon = social.icon
							return (
								<Link
									key={social.name}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
								>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Icon className="w-5 h-5" />
											<span className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
												{social.name}
											</span>
										</div>
									</div>
								</Link>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
})

ConnectSection.displayName = "ConnectSection"

export { ConnectSection }
