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
  SidebarRail,
  SidebarTrigger,
} from "@hezaerd/ui/components/sidebar";

type DashboardChromeBrand = {
  initials: string;
  title: string;
  subtitle: string;
};

type DashboardChromeProps = {
  brand: DashboardChromeBrand;
  nav: React.ReactNode;
  sidebarTop?: React.ReactNode;
  footer?: React.ReactNode;
  headerStart?: React.ReactNode;
  headerEnd?: React.ReactNode;
  subHeader?: React.ReactNode;
  headerTitle?: string | null;
  email: string;
  children: React.ReactNode;
};

export function DashboardChrome({
  brand,
  nav,
  sidebarTop,
  footer,
  headerStart,
  headerEnd,
  subHeader,
  headerTitle,
  email,
  children,
}: DashboardChromeProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="border-border overflow-hidden border-b">
          <div className="flex items-center gap-2 overflow-hidden transition-[gap] duration-200 ease-linear group-data-[collapsible=icon]:gap-0">
            <div className="flex min-w-0 max-w-full flex-1 items-center gap-2 overflow-hidden opacity-100 transition-[max-width,opacity,flex-grow] duration-200 ease-linear group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:grow-0 group-data-[collapsible=icon]:opacity-0">
              <div className="bg-primary/15 border-primary/30 flex size-8 shrink-0 items-center justify-center rounded-lg border">
                <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                  {brand.initials}
                </span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="font-display truncate text-sm font-semibold tracking-tight whitespace-nowrap">
                  {brand.title}
                </p>
                <p className="text-muted-foreground truncate font-mono text-[10px] font-medium tracking-[0.18em] whitespace-nowrap uppercase">
                  {brand.subtitle}
                </p>
              </div>
            </div>
            <SidebarTrigger className="hidden size-8 shrink-0 md:flex" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {sidebarTop}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{nav}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {footer ? <SidebarFooter className="border-border border-t">{footer}</SidebarFooter> : null}
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="border-border shrink-0 border-b">
          <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="shrink-0 md:hidden" />
              {headerStart}
            </div>
            {headerTitle ? (
              <p className="font-display truncate text-sm font-semibold tracking-tight">
                {headerTitle}
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            <div className="flex items-center justify-end gap-3">
              {headerEnd ?? (
                <>
                  <p className="text-muted-foreground hidden text-sm sm:block">{email}</p>
                  <a
                    href="/api/auth/sign-out"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    Déconnexion
                  </a>
                </>
              )}
            </div>
          </header>
          {subHeader ? <div className="px-4 md:px-6">{subHeader}</div> : null}
        </div>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
