import Link from "next/link";

interface NavLinkProps {
  name: string;
  href: string;
}

const NavLink = ({ name, href }: NavLinkProps) => {
  return (
    <Link
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      href={href}
      prefetch={false}
    >
      {name}
    </Link>
  );
};

export { NavLink, type NavLinkProps };
