import type { PortalClient } from "@/lib/portal-fixtures";

import {
  File01Icon,
  Globe02Icon,
  Home01Icon,
  Invoice01Icon,
  MessageIcon,
  PieChart01Icon,
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
  icon: IconSvgElement;
};

const coreAreas: WorkspaceArea[] = [
  { label: "Home", segment: "", icon: Home01Icon },
  { label: "Invoices", segment: "invoices", icon: Invoice01Icon },
  { label: "Files", segment: "files", icon: File01Icon },
];

const featureAreas: WorkspaceArea[] = [
  { label: "Insights", segment: "insights", feature: "insights", icon: PieChart01Icon },
  { label: "Website", segment: "website", feature: "website", icon: Globe02Icon },
];

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientWorkspaceShell({
  client,
  email,
  children,
}: ClientWorkspaceShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const showSwitcher = isOperatorRole();
  const areas = [
    ...coreAreas,
    ...featureAreas.filter((area) =>
      area.feature ? client.features[area.feature] : true,
    ),
  ];

  function isAreaActive(segment: WorkspaceArea["segment"]) {
    const base = `/w/${client.id}`;
    if (segment === "") {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname.startsWith(`${base}/${segment}`);
  }

  const initials = getClientInitials(client.name);
  const hasAttention = client.needsAttention.length > 0;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-border border-b">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-primary/15 border-primary/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                {initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-sm font-semibold tracking-tight">
                {client.name}
              </p>
              <p className="text-muted-foreground font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
                Client Portal
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {areas.map((area) => {
                  const active = isAreaActive(area.segment);
                  const showDot = area.segment === "" && hasAttention && !active;
                  return (
                    <SidebarMenuItem key={area.label}>
                      <SidebarMenuButton
                        render={
                          <Link
                            to={
                              area.segment === ""
                                ? "/w/$clientId"
                                : `/w/$clientId/${area.segment}`
                            }
                            params={{ clientId: client.id }}
                          />
                        }
                        isActive={active}
                        tooltip={area.label}
                      >
                        <HugeiconsIcon
                          icon={area.icon}
                          size={16}
                          className="shrink-0"
                        />
                        <span>{area.label}</span>
                        {showDot && (
                          <span className="bg-primary ml-auto h-1.5 w-1.5 rounded-full" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-border border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link
                    to="/w/$clientId/message"
                    params={{ clientId: client.id }}
                  />
                }
                isActive={pathname.startsWith(`/w/${client.id}/message`)}
                tooltip="Message Hezaerd"
              >
                <HugeiconsIcon icon={MessageIcon} size={16} className="shrink-0" />
                <span>Message Hezaerd</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="shrink-0" />
          <Separator orientation="vertical" className="mr-1 h-4 shrink-0" />
          {showSwitcher ? <WorkspaceSwitcher currentClient={client} /> : null}
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
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
