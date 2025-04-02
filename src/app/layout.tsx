import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/navbar";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  });

  const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  });

export const metadata: Metadata = {
  title: "Hezaerd",
  description: "Hezaerd personal website and portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${ptSans.variable} antialiased relative`}
      >
        <div className="texture" />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
