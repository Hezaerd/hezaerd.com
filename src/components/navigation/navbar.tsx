import Link from "next/link";
import { NavLink } from "@/components/navigation/navlink";
import NavbarSheet from "./navbar-sheet";
import NavbarProfile from "./navbar-profile";

export default function Navbar() {
  return (
    <div className="fixed left-0 top-0 z-50 w-full border-b border-muted/50 bg-background/60 shadow-lg backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={"/"} prefetch={false} className="flex items-center gap-4">
          <span className="text-lg font-semibold">Portfolio</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-4 md:flex">
            <NavLink name="Home" href="/" />
            <NavLink name="About" href="/about" />
            <NavLink name="Projects" href="/projects" />
            <NavLink name="Skills" href="/skills" />
          </nav>
          <NavbarSheet />
        </div>

        <div className="flex items-center gap-4">
          <NavbarProfile />
        </div>
      </div>
    </div>
  );
}
