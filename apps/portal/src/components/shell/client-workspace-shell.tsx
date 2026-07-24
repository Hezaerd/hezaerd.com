import type { PortalClient } from "@/lib/portal-fixtures";

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

import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";
import { isOperatorRole } from "@/lib/portal-role";

type ClientWorkspaceShellProps = {
  client: PortalClient;
  email: string;
  children: React.ReactNode;
};

type WorkspaceArea = {
  label: string;
  segment: "" | "invoices" | "files" | "insights" | "website";
  feature?: keyof PortalClient["features"];
};

const coreAreas: WorkspaceArea[] = [
  { label: "Home", segment: "" },
  { label: "Invoices", segment: "invoices" },
  { label: "Files", segment: "files" },
];

const featureAreas: WorkspaceArea[] = [
  { label: "Insights", segment: "insights", feature: "insights" },
  { label: "Website", segment: "website", feature: "website" },
];

export function ClientWorkspaceShell({ client, email, children }: ClientWorkspaceShellProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showSwitcher = isOperatorRole();
  const areas = [
    ...coreAreas,
    ...featureAreas.filter((area) => (area.feature ? client.features[area.feature] : true)),
  ];

  function isAreaActive(segment: WorkspaceArea["segment"]) {
    const base = `/w/${client.id}`;
    if (segment === "") {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname.startsWith(`${base}/${segment}`);
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-border border-b">
          <div className="flex flex-col gap-1 px-2 py-1">
            <p className="text-primary font-mono text-xs font-medium tracking-[0.2em] uppercase">
              Client Workspace
            </p>
            <p className="font-display text-sm font-semibold tracking-tight">{client.name}</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {areas.map((area) => (
                  <SidebarMenuItem key={area.label}>
                    <SidebarMenuButton
                      render={
                        <Link
                          to={area.segment === "" ? "/w/$clientId" : `/w/$clientId/${area.segment}`}
                          params={{ clientId: client.id }}
                        />
                      }
                      isActive={isAreaActive(area.segment)}
                      tooltip={area.label}
                    >
                      <span>{area.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-border border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/w/$clientId/message" params={{ clientId: client.id }} />}
                isActive={pathname.startsWith(`/w/${client.id}/message`)}
                tooltip="Message Hezaerd"
              >
                <span>Message Hezaerd</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          {showSwitcher ? <WorkspaceSwitcher currentClient={client} /> : null}
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
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
