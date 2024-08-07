import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Author } from "next/dist/lib/metadata/types/metadata-types";

import { ThemeProvider } from "@/components/theme/theme-provider";
import Navbar from "@/components/navigation/navbar";

const inter = Inter({ subsets: ["latin"] });

const author: Author = {
  name: "Hezaerd",
  url: "https://hezaerd.com",
};

export const metadata: Metadata = {
  title: "Hezaerd Portfolio",
  description: "Hezaerd Portfolio",
  authors: [author],
  keywords: ["Hezaerd", "Portfolio", "developer", "isart", "isart digital"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
