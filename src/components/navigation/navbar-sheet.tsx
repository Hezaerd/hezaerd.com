import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { NavLink } from "./navlink";

export default function NavbarSheet() {
  return (
    <Sheet>

      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <HamburgerMenuIcon className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs bg-background p-6">

        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <SheetDescription className="text-muted">
          Navigation links
        </SheetDescription>

        <nav className="grid gap-4">
          <NavLink name="Home" href="/" />
          <NavLink name="About" href="/about" />
          <NavLink name="Projects" href="/projects" />
          <NavLink name="Skills" href="/skills" />
        </nav>
      </SheetContent>
    </Sheet>
  )
}