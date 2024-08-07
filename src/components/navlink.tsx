import { FC } from "react";
import Link from "next/link";

interface NavLinkProps {
  name: string;
  href: string;
}

const NavLink = ({ name, href }: NavLinkProps) => {
  return (
    <li>
      <Link href={href}>{name}</Link>
    </li>
  );
};

export { NavLink, type NavLinkProps };
