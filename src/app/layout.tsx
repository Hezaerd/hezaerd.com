import "./globals.css";
import { Inter } from "next/font/google";

import { createMetadata } from "@/lib/metadata";
import { Analytics } from "./analytics";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Navbar from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Toaster } from "@/components/ui/toaster";
import ShiningStars from "@/components/ui/shining-stars";
import { StarButton } from "@/components/ui/star-button";

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ShiningStars
            starImages={["/shining-stars/star.png", "/shining-stars/point.png"]}
          />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <StarButton />
          <Toaster />
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
