import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PortfolioProvider } from "@/components/providers/PortfolioProvider";
import { SectionIdsProvider } from "@/components/providers/SectionIdsProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// Dynamic metadata that updates when personal info changes
export async function generateMetadata(): Promise<Metadata> {
	// Dynamically import to get the latest data
	const { personalInfo } = await import("../data/personal-info");

	return {
		title: `${personalInfo.name} - ${personalInfo.role}`,
		description: personalInfo.bio,
		icons: {
			icon: "/favicon.ico",
		},
	};
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<PortfolioProvider>
					<SectionIdsProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
							<Toaster />
						</ThemeProvider>
					</SectionIdsProvider>
				</PortfolioProvider>
			</body>
		</html>
	);
}
