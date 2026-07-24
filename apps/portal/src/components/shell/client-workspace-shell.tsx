import type { PortalClient } from "@/lib/portal-fixtures";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hezaerd/ui/components/sidebar";
import {
  ArrowLeft01Icon,
  File01Icon,
  Globe02Icon,
  Home01Icon,
  Invoice01Icon,
  MessageIcon,
  PieChart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

import { DashboardChrome } from "@/components/shell/dashboard-chrome";
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
  {
    label: "Insights",
    segment: "insights",
    feature: "insights",
    icon: PieChart01Icon,
  },
  {
    label: "Website",
    segment: "website",
    feature: "website",
    icon: Globe02Icon,
  },
];

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientWorkspaceShell({ client, email, children }: ClientWorkspaceShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
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

  const hasAttention = client.needsAttention.length > 0;

  return (
    <DashboardChrome
      brand={{
        initials: getClientInitials(client.name),
        title: client.name,
        subtitle: "Client Portal",
      }}
      email={email}
      headerStart={
        showSwitcher ? (
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/op"
              className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="shrink-0" />
              <span>Operator</span>
            </Link>
            <span className="text-border select-none" aria-hidden>
              /
            </span>
            <WorkspaceSwitcher currentClient={client} />
          </div>
        ) : null
      }
      nav={areas.map((area) => {
        const active = isAreaActive(area.segment);
        const showDot = area.segment === "" && hasAttention && !active;
        return (
          <SidebarMenuItem key={area.label}>
            <SidebarMenuButton
              render={
                <Link
                  to={area.segment === "" ? "/w/$clientId" : `/w/$clientId/${area.segment}`}
                  params={{ clientId: client.id }}
                />
              }
              isActive={active}
              tooltip={area.label}
            >
              <HugeiconsIcon icon={area.icon} size={16} className="shrink-0" />
              <span>{area.label}</span>
              {showDot ? <span className="bg-primary ml-auto h-1.5 w-1.5 rounded-full" /> : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
      footer={
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/w/$clientId/message" params={{ clientId: client.id }} />}
              isActive={pathname.startsWith(`/w/${client.id}/message`)}
              tooltip="Message Hezaerd"
            >
              <HugeiconsIcon icon={MessageIcon} size={16} className="shrink-0" />
              <span>Message Hezaerd</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      }
    >
      {children}
    </DashboardChrome>
  );
}
