"use client";

import { usePathname } from "next/navigation";
import NavbarProfile from "./navbar-profile";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { Home, BarChart2, FolderGit2 } from "lucide-react";
import { ScrollProgress } from "./scroll-progress";

const navItems = [
  { href: "/", name: "Home", icon: <Home className="mr-2 h-4 w-4" /> },
  {
    href: "/stats",
    name: "Stats",
    icon: <BarChart2 className="mr-2 h-4 w-4" />,
  },
  {
    href: "/projects",
    name: "Projects",
    icon: <FolderGit2 className="mr-2 h-4 w-4" />,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed left-0 top-0 z-50 w-full border-b border-muted/50 bg-background/60 shadow-lg backdrop-blur-lg">
        <div className="container relative flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <NavbarProfile />
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-accent-foreground",
                  pathname === item.href
                    ? "text-accent-foreground"
                    : "text-muted-foreground",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">Portfolio</span>
            <MobileNav />
          </div>
        </div>
      </div>
      <ScrollProgress />
    </>
  );
}
