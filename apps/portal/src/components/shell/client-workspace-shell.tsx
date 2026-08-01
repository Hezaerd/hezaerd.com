import type { PortalClient } from "@/lib/portal-types";

import { BottomNav, BottomNavItem } from "@hezaerd/ui/components/bottom-nav";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hezaerd/ui/components/sidebar";
import {
  File01Icon,
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
  mobileLabel: string;
  segment: "" | "invoices" | "files" | "insights";
  feature?: keyof PortalClient["features"];
  icon: IconSvgElement;
};

const coreAreas: WorkspaceArea[] = [
  { label: "Accueil", mobileLabel: "Accueil", segment: "", icon: Home01Icon },
  { label: "Factures", mobileLabel: "Factures", segment: "invoices", icon: Invoice01Icon },
  { label: "Fichiers", mobileLabel: "Fichiers", segment: "files", icon: File01Icon },
];

const featureAreas: WorkspaceArea[] = [
  {
    label: "Statistiques",
    mobileLabel: "Stats",
    segment: "insights",
    feature: "insights",
    icon: PieChart01Icon,
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
  const areas = [
    ...coreAreas,
    ...featureAreas.filter((area) => (area.feature ? client.features[area.feature] : true)),
  ];

  return (
    <DashboardChrome
      brand={{
        initials: getClientInitials(client.name),
        title: client.name,
        subtitle: "Espace client",
      }}
      email={email}
      mobileBottomNav={<ClientWorkspaceMobileBottomNav client={client} areas={areas} />}
      nav={areas.map((area) => (
        <WorkspaceNavItem key={area.label} client={client} area={area} />
      ))}
    >
      {children}
    </DashboardChrome>
  );
}

function ClientWorkspaceMobileBottomNav({
  client,
  areas,
}: {
  client: PortalClient;
  areas: WorkspaceArea[];
}) {
  return (
    <BottomNav>
      {areas.map((area) => (
        <WorkspaceBottomNavItem key={area.label} client={client} area={area} />
      ))}
    </BottomNav>
  );
}

function useWorkspaceAreaActive(clientId: string, segment: WorkspaceArea["segment"]) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const base = `/w/${clientId}`;
  if (segment === "") {
    return pathname === base || pathname === `${base}/`;
  }
  return pathname.startsWith(`${base}/${segment}`);
}

function WorkspaceNavItem({ client, area }: { client: PortalClient; area: WorkspaceArea }) {
  const active = useWorkspaceAreaActive(client.id, area.segment);

  return (
    <SidebarMenuItem>
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
}

function WorkspaceBottomNavItem({ client, area }: { client: PortalClient; area: WorkspaceArea }) {
  const active = useWorkspaceAreaActive(client.id, area.segment);

  return (
    <BottomNavItem
      render={
        <Link
          to={area.segment === "" ? "/w/$clientId" : `/w/$clientId/${area.segment}`}
          params={{ clientId: client.id }}
        />
      }
      isActive={active}
      icon={<HugeiconsIcon icon={area.icon} size={20} className="shrink-0" />}
      label={area.mobileLabel}
    />
  );
}
