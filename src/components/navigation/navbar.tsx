import Link from "next/link";
import { NavLink } from "@/components/navigation/navlink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  return (
    <div className="sticky top-0 left-0 z-50 w-full backdrop-blur-lg bg-background/60 border-b border-muted/50 shadow-lg">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link href={"/"} prefetch={false} className="flex items-center gap-4">
          <span className="text-lg font-semibold">Portfolio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <NavLink name="Home" href="/" />
          <NavLink name="About" href="/about" />
          <NavLink name="Projects" href="/projects" />
          <NavLink name="Skills" href="/skills" />
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Hezaerd</div>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/hezaerd.png" alt="Hezaerd" />
            <AvatarFallback>HZ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
