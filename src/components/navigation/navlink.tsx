import Link from "next/link";

interface NavLinkProps {
  name: string;
  href: string;
  prefetch?: boolean;
}

export const NavLink = ({ name, href, prefetch = false }: NavLinkProps) => {
  return (
    <Link
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      href={href}
      prefetch={prefetch}
    >
      {name}
    </Link>
  );
};