import { cn } from "@hezaerd/ui";

import { Link } from "@tanstack/react-router";

import { brandNav } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-border/60 sticky top-0 z-50 border-b bg-[#0f1210]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-display text-primary text-xl font-semibold tracking-tight">
          Hezaerd
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {brandNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium",
              )}
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/contact"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          Start a project
        </Link>
      </div>
    </header>
  );
}
