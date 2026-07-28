import { SidebarMenuButton, SidebarMenuItem } from "@hezaerd/ui/components/sidebar";
import {
  Home01Icon,
  Invoice01Icon,
  Setting07Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

import { DashboardChrome } from "@/components/shell/dashboard-chrome";
import {
  OperatorChromeProvider,
  useOperatorChromeOverrides,
} from "@/components/shell/operator-chrome-context";
import { getOperatorHeaderTitle } from "@/lib/operator-header-title";

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
  { label: "Accueil", to: "/op", icon: Home01Icon },
  { label: "Clients", to: "/op/clients", icon: UserGroupIcon },
  { label: "Factures", to: "/op/invoices", icon: Invoice01Icon },
  { label: "Paramètres", to: "/op/settings", icon: Setting07Icon },
];

export function OperatorShell({ email, children }: OperatorShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const defaultHeaderTitle = getOperatorHeaderTitle(pathname);

  return (
    <OperatorChromeProvider>
      <OperatorShellChrome email={email} defaultHeaderTitle={defaultHeaderTitle}>
        {children}
      </OperatorShellChrome>
    </OperatorChromeProvider>
  );
}

function OperatorShellChrome({
  email,
  defaultHeaderTitle,
  children,
}: {
  email: string;
  defaultHeaderTitle: string;
  children: React.ReactNode;
}) {
  const chrome = useOperatorChromeOverrides();

  const headerTitle =
    chrome.headerTitle === null ? undefined : (chrome.headerTitle ?? defaultHeaderTitle);

  return (
    <DashboardChrome
      brand={{
        initials: "HZ",
        title: "Hezaerd",
        subtitle: "Opérateur",
      }}
      headerTitle={headerTitle}
      headerStart={chrome.headerStart}
      headerEnd={chrome.headerEnd}
      subHeader={chrome.subHeader}
      email={email}
      nav={navItems.map((item) => (
        <NavItemLink key={item.to} item={item} />
      ))}
    >
      {children}
    </DashboardChrome>
  );
}

function NavItemLink({ item }: { item: NavItem }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link to={item.to} />}
        isActive={
          item.to === "/op"
            ? pathname === "/op" || pathname === "/op/"
            : pathname.startsWith(item.to as string)
        }
        tooltip={item.label}
      >
        <HugeiconsIcon icon={item.icon} size={16} className="shrink-0" />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
