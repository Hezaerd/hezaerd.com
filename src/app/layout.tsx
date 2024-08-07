import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Author } from "next/dist/lib/metadata/types/metadata-types";

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
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
