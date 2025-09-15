"use client";

import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { useId } from "react";
import { Button } from "@/components/ui/button";

export function Contact() {
	const id = useId();

	const handleEmailClick = () => {
		window.location.href = "mailto:hezaerd@hezaerd.com";
	};

	return (
		<section
			id={id}
			className="py-24 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-background to-muted/20"
		>
			<div className="max-w-4xl mx-auto">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
						<Mail className="w-8 h-8 text-primary" />
						Get in Touch
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						I'm actively looking for new opportunities and exciting projects.
						Feel free to reach out if you'd like to collaborate!
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true }}
					className="flex justify-center"
				>
					<Button
						onClick={handleEmailClick}
						size="lg"
						className="min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4"
					>
						<Mail className="w-5 h-5 mr-2" />
						Email Me
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
