import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Author } from "next/dist/lib/metadata/types/metadata-types";
import { GoogleAnalytics } from "@next/third-parties/google";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import Navbar from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Toaster } from "@/components/ui/toaster";
import { SkipNav } from "@/components/navigation/skip-nav";
const inter = Inter({ subsets: ["latin"] });

const author: Author = {
  name: "Hezaerd",
  url: "https://hezaerd.com",
};

export const metadata: Metadata = {
  title: "Hezaerd - Portfolio",
  description: "I'm, Hezaerd, a software engineer and game developer.",
  authors: [author],
  keywords: ["Hezaerd", "Portfolio", "developer", "isart", "isart digital"],
  openGraph: {
    title: "Hezaerd - Portfolio",
    description: "I'm, Hezaerd, a software engineer and game developer.",
    type: "website",
    url: "https://hezaerd.com",
    siteName: "Hezaerd",
    images: [
      {
        url: "https://github.com/hezaerd.png",
        width: 1200,
        height: 630,
        alt: "Hezaerd",
      },
    ],
  },
  twitter: {
    site: "@hezaerd",
    creator: "@hezaerd",
    description: "I'm, Hezaerd, a software engineer and game developer.",
    title: "Hezaerd - Portfolio",
    images: [
      {
        url: "https://github.com/hezaerd.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SkipNav />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId="G-ZBGGWW1HXC" />
      </body>
    </html>
  );
}
