import Link from "next/link";

interface NavLinkProps {
  name: string;
  href: string;
}

const NavLink = ({ name, href }: NavLinkProps) => {
  return (
    <Link
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      href={href}
      prefetch={false}
    >
      {name}
    </Link>
  );
};

export { NavLink, type NavLinkProps };
