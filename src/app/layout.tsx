import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";

import { createMetadata } from "@/lib/metadata";
import { Analytics } from "./analytics";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Navbar from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Toaster } from "@/components/ui/toaster";
import { SkipNav } from "@/components/navigation/skip-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = createMetadata({
  title: {
    absolute: "Hezaerd",
    template: "%s | Hezaerd",
  },
  description: "I'm, Hezaerd, a software engineer and game developer.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Link rel="icon" href="https://github.com/hezaerd.png" />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SkipNav />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
