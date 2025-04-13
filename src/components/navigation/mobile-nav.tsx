import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { NavLink } from "./navlink";
import { usePathname } from "next/navigation";
import { Home, BarChart2, FolderGit2 } from "lucide-react";

const navItems = [
  { href: "/", name: "Home", icon: <Home className="mr-3 h-5 w-5" /> },
  {
    href: "/stats",
    name: "Stats",
    icon: <BarChart2 className="mr-3 h-5 w-5" />,
  },
  {
    href: "/projects",
    name: "Projects",
    icon: <FolderGit2 className="mr-3 h-5 w-5" />,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <HamburgerMenuIcon className="h-6 w-6" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
        <div className="flex items-center justify-between">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl">Menu</SheetTitle>
          </SheetHeader>
        </div>

        <SheetDescription className="mb-6 text-muted">
          Navigation links
        </SheetDescription>

        <nav className="grid gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              name={item.name}
              href={item.href}
              isActive={pathname === item.href}
              icon={item.icon}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
