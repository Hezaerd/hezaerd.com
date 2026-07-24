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
  SidebarProvider,
  SidebarTrigger,
} from "@hezaerd/ui/components/sidebar";

import { Link } from "@tanstack/react-router";

type DashboardChromeBrand = {
  initials: string;
  title: string;
  subtitle: string;
};

type DashboardChromeProps = {
  brand: DashboardChromeBrand;
  nav: React.ReactNode;
  footer?: React.ReactNode;
  headerStart?: React.ReactNode;
  email: string;
  children: React.ReactNode;
};

export function DashboardChrome({
  brand,
  nav,
  footer,
  headerStart,
  email,
  children,
}: DashboardChromeProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-border border-b">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-primary/15 border-primary/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                {brand.initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-sm font-semibold tracking-tight">
                {brand.title}
              </p>
              <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
                {brand.subtitle}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{nav}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {footer ? <SidebarFooter className="border-border border-t">{footer}</SidebarFooter> : null}
      </Sidebar>

      <SidebarInset>
        <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="shrink-0" />
          <Separator orientation="vertical" className="mr-1 shrink-0 self-stretch" />
          {headerStart}
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
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
