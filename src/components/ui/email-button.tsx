"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailButtonProps {
	email: string;
	className?: string;
}

export function EmailButton({ email, className }: EmailButtonProps) {
	const handleEmailClick = () => {
		window.location.href = `mailto:${email}`;
	};

	return (
		<Button
			onClick={handleEmailClick}
			size="lg"
			className={className}
		>
			<Mail className="w-5 h-5 mr-2" />
			Email Me
		</Button>
	);
}
