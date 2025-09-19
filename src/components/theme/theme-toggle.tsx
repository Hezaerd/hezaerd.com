"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="w-9 h-9 transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
			>
				<div className="w-4 h-4" />
			</Button>
		);
	}

	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="w-9 h-9 transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105"
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
		>
			<div className="flex items-center justify-center">
				{theme === "dark" ? (
					<Sun className="w-4 h-4 text-amber-500" />
				) : (
					<Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
				)}
			</div>
		</Button>
	);
}
