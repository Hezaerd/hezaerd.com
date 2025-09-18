import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
	preload: true,
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
	preload: false,
});

export const metadata: Metadata = {
	metadataBase: new URL("https://hezaerd.com"),
	title: {
		default: "Hezaerd - Software Engineer",
		template: "%s | Hezaerd",
	},
	description:
		"Passionate about building high-performance software solutions, ranging from game engines, game development tools, to full-stack applications. Specialized in C++ and C#",
	keywords: [
		"software engineer",
		"game developer",
		"game engine",
		"full stack",
	],
	authors: [{ name: "Hezaerd", url: "https://hezaerd.com" }],
	creator: "Hezaerd",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://hezaerd.com",
		siteName: "Hezaerd Portfolio",
		title: "Hezaerd - Software Engineer",
		description:
			"Passionate about building high-performance software solutions, ranging from game engines, game development tools, to full-stack applications. Specialized in C++ and C#",
	},
	twitter: {
		card: "summary_large_image",
		title: "Hezaerd - Software Engineer",
		description:
			"Passionate about building high-performance software solutions, ranging from game engines, game development tools, to full-stack applications. Specialized in C++ and C#",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="dns-prefetch" href="https://api.github.com" />

				{/* Viewport optimization */}
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>

				{/* Theme color for mobile browsers */}
				<meta name="theme-color" content="#000000" />
				<meta name="color-scheme" content="dark light" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AnalyticsProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
				</AnalyticsProvider>
			</body>
		</html>
	);
}
