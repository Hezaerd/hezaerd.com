"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function Footer() {
	const { theme, setTheme } = useTheme()
	const currentYear = new Date().getFullYear()

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark")
	}

	return (
		<footer className="py-12 sm:py-16 border-t border-border">
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
				<div className="space-y-2">
					<div className="text-sm text-muted-foreground">
						© {currentYear} Hezaerd. All rights reserved.
					</div>
					<div className="text-xs text-muted-foreground">
						Built with Next.js, TailwindCSS, and Shadcn/UI
					</div>
				</div>

				<div className="flex items-center gap-4">
					<button
						onClick={toggleTheme}
						className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
						aria-label="Toggle theme"
					>
						{theme === "dark" ? (
							<Sun className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
						) : (
							<Moon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
						)}
					</button>
				</div>
			</div>
		</footer>
	)
}
