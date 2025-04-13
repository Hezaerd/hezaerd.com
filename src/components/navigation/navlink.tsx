import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavLinkProps {
  name: string;
  href: string;
  isActive?: boolean;
  icon?: ReactNode;
}

const NavLink = ({ name, href, isActive, icon }: NavLinkProps) => {
  return (
    <Link
      className={cn(
        "flex items-center rounded-md px-3 py-4 text-base font-medium transition-all hover:bg-accent/30",
        isActive
          ? "bg-accent/50 font-semibold text-primary"
          : "text-muted-foreground",
      )}
      href={href}
      prefetch={false}
    >
      {icon}
      {name}
    </Link>
  );
};

export { NavLink, type NavLinkProps };
