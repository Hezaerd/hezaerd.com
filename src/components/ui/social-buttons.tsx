"use client";

import { Button } from "@/components/ui/button";
import { socials } from "@/data/socials";

export function SocialButtons() {
	return (
		<>
			{socials.map((social) => (
				<Button
					key={social.name}
					variant="ghost"
					size="icon"
					onClick={() => {
						window.open(social.url, "_blank");
					}}
					className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
				>
					<social.icon className="w-5 h-5" />
					<span className="sr-only">{social.name}</span>
				</Button>
			))}
		</>
	);
}
