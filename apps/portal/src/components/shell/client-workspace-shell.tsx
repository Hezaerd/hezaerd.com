import type { PortalClient } from "@/lib/portal-types";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hezaerd/ui/components/sidebar";
import {
  File01Icon,
  Globe02Icon,
  Home01Icon,
  Invoice01Icon,
  PieChart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

import { DashboardChrome } from "@/components/shell/dashboard-chrome";

type ClientWorkspaceShellProps = {
  client: PortalClient;
  email: string;
  children: React.ReactNode;
};

type WorkspaceArea = {
  label: string;
  segment: "" | "invoices" | "files" | "insights" | "cms";
  feature?: keyof PortalClient["features"];
  icon: IconSvgElement;
};

const coreAreas: WorkspaceArea[] = [
  { label: "Accueil", segment: "", icon: Home01Icon },
  { label: "Factures", segment: "invoices", icon: Invoice01Icon },
  { label: "Fichiers", segment: "files", icon: File01Icon },
];

const featureAreas: WorkspaceArea[] = [
  {
    label: "Statistiques",
    segment: "insights",
    feature: "insights",
    icon: PieChart01Icon,
  },
  {
    label: "Mon site",
    segment: "cms",
    feature: "cms",
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
    <DashboardChrome
      brand={{
        initials: getClientInitials(client.name),
        title: client.name,
        subtitle: "Espace client",
      }}
      email={email}
      nav={areas.map((area) => {
        const active = isAreaActive(area.segment);
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
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    >
      {children}
    </DashboardChrome>
  );
}
