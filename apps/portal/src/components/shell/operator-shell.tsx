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

const navItems = [
  { label: "Home", to: "/op" },
  { label: "Clients", to: "/op/clients" },
  { label: "Invoices", to: "/op/invoices" },
  { label: "Settings", to: "/op/settings" },
] as const;

export function OperatorShell({ email, children }: OperatorShellProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-border border-b">
          <div className="flex flex-col gap-1 px-2 py-1">
            <p className="text-primary font-mono text-xs font-medium tracking-[0.2em] uppercase">
              Portal
            </p>
            <p className="font-display text-sm font-semibold tracking-tight">Operator Home</p>
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
                          : pathname.startsWith(item.to)
                      }
                      tooltip={item.label}
                    >
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-border border-t">
          <p className="text-muted-foreground px-2 py-1 text-xs">Practice operator shell</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <div className="flex flex-1 items-center justify-end gap-3">
            <p className="text-muted-foreground hidden text-sm sm:block">{email}</p>
            <Link
              to="/signout"
              className="border-border hover:bg-accent rounded-md border px-3 py-2 text-sm font-medium"
            >
              Sign out
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
