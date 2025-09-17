import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { PortfolioProvider } from "@/components/providers/PortfolioProvider";
import { SectionIdsProvider } from "@/components/providers/SectionIdsProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
    display: 'swap',
    preload: true,
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
    display: 'swap',
    preload: false,
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
				<AnalyticsProvider>
					<PortfolioProvider>
                        <ReactQueryDevtools initialIsOpen={false} />
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
				</AnalyticsProvider>
			</body>
		</html>
	);
}
