"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactFormSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	email: z.email("Please enter a valid email address"),
	subject: z.string().min(5, "Subject must be at least 5 characters"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function Contact() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const id = useId();

	const form = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			fullName: "",
			email: "",
			subject: "",
			message: "",
		},
	});

	// Don't render if contact service is disabled
	if (contactConfig.service === "none") {
		return null;
	}

	const onSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);

		// Show loading toast
		const loadingToast = toast.loading("Sending your message...", {
			description: "Please wait while we process your request.",
		});

		try {
			let success = false;

			if (contactConfig.service === "formspree" && contactConfig.endpoint) {
				// Submit to Formspree
				const response = await fetch(contactConfig.endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: data.fullName,
						email: data.email,
						subject: data.subject,
						message: data.message,
					}),
				});
				success = response.ok;
			} else if (contactConfig.service === "netlify") {
				// Submit to Netlify Forms (would need to be handled differently in production)
				const formData = new FormData();
				formData.append("name", data.fullName);
				formData.append("email", data.email);
				formData.append("subject", data.subject);
				formData.append("message", data.message);
				formData.append("form-name", "contact");

				const response = await fetch("/", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams(formData as any).toString(),
				});
				success = response.ok;
			} else if (contactConfig.service === "custom" && contactConfig.endpoint) {
				// Submit to custom endpoint
				const response = await fetch(contactConfig.endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
				success = response.ok;
			} else {
				// No service configured, just simulate success
				await new Promise((resolve) => setTimeout(resolve, 1000));
				success = true;
				console.log("Form submitted (no service configured):", data);
			}

			if (success) {
				// Dismiss loading toast and show success
				toast.dismiss(loadingToast);
				toast.success("Message sent successfully!", {
					description: `Thank you ${data.fullName}! I'll get back to you soon.`,
					duration: 5000,
				});

				// Reset form after successful submission
				form.reset();
			} else {
				throw new Error("Failed to submit form");
			}
		} catch (error) {
			// Dismiss loading toast and show error
			toast.dismiss(loadingToast);
			toast.error("Failed to send message", {
				description: "Something went wrong. Please try again later.",
				duration: 5000,
			});
			console.error("Failed to submit form:", error);
		} finally {
			setIsSubmitting(false);
		}
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
						I'm always interested in new opportunities and exciting projects.
						Feel free to reach out if you'd like to collaborate!
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true }}
					className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg"
				>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="fullName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-foreground font-medium">
												Full Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder="John Doe"
													className="bg-background/50"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-foreground font-medium">
												Email
											</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="john.doe@example.com"
													className="bg-background/50"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="subject"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-foreground font-medium">
											Subject
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter the subject of your message"
												className="bg-background/50"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-foreground font-medium">
											Message
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Type your message here"
												className="bg-background/50 min-h-[150px] resize-none"
												maxLength={500}
												{...field}
											/>
										</FormControl>
										<div className="flex justify-between items-center mt-2">
											<FormMessage />
											<span className="text-sm text-muted-foreground">
												{form.watch("message")?.length || 0}/500
											</span>
										</div>
									</FormItem>
								)}
							/>

							<div className="flex justify-center pt-4">
								<Button
									type="submit"
									size="lg"
									disabled={isSubmitting}
									className="min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
								>
									{isSubmitting ? (
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											Sending...
										</div>
									) : (
										<div className="flex items-center gap-2">
											<Send className="w-4 h-4" />
											Send Message
										</div>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</motion.div>
			</div>
		</section>
	);
}
