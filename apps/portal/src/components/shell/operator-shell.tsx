import {
  Home01Icon,
  Invoice01Icon,
  Setting07Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Separator } from "@hezaerd/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@hezaerd/ui/components/sidebar";

import { Link, useRouterState } from "@tanstack/react-router";

type OperatorShellProps = {
  email: string;
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  to: "/op" | "/op/clients" | "/op/invoices" | "/op/settings";
  icon: IconSvgElement;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/op", icon: Home01Icon },
  { label: "Clients", to: "/op/clients", icon: UserGroupIcon },
  { label: "Invoices", to: "/op/invoices", icon: Invoice01Icon },
  { label: "Settings", to: "/op/settings", icon: Setting07Icon },
];

export function OperatorShell({ email, children }: OperatorShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-border border-b">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-primary/15 border-primary/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                HZ
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold tracking-tight">
                Hezaerd
              </p>
              <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
                Operator
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={<Link to={item.to} />}
                      isActive={
                        item.to === "/op"
                          ? pathname === "/op" || pathname === "/op/"
                          : pathname.startsWith(item.to as string)
                      }
                      tooltip={item.label}
                    >
                      <HugeiconsIcon
                        icon={item.icon}
                        size={16}
                        className="shrink-0"
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-border border-t">
          <div className="px-3 py-2">
            <p className="text-muted-foreground font-mono text-[10px] tracking-wide">
              Practice Operator
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="shrink-0" />
          <Separator orientation="vertical" className="mr-1 h-4 shrink-0" />
          <div className="flex flex-1 items-center justify-end gap-3">
            <p className="text-muted-foreground hidden text-sm sm:block">{email}</p>
            <Link
              to="/signout"
              className="border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Sign out
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
