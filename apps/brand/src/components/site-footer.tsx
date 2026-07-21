import { Link } from "@tanstack/react-router";

import { brandNav, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-primary text-lg font-semibold">Hezaerd</p>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Software engineering for products that need to be fast, durable, and worth shipping.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {brandNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.portfolioUrl}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Portfolio
          </a>
        </div>
      </div>
      <div className="border-border border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-6 py-6 text-sm">
          © {year} Hezaerd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
