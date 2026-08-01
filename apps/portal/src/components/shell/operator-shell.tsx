import { SidebarMenuButton, SidebarMenuItem } from "@hezaerd/ui/components/sidebar";
import { BottomNav, BottomNavItem } from "@hezaerd/ui/components/bottom-nav";
import {
  Home01Icon,
  Invoice01Icon,
  Setting07Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

import {
  OperatorCommandPalette,
  OperatorCommandPaletteHeaderTrigger,
  OperatorCommandPaletteProvider,
  OperatorCommandPaletteTrigger,
} from "@/components/command-palette/operator-command-palette";
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
  mobileLabel: string;
  to: "/op" | "/op/clients" | "/op/invoices" | "/op/settings";
  icon: IconSvgElement;
};

const navItems: NavItem[] = [
  { label: "Accueil", mobileLabel: "Accueil", to: "/op", icon: Home01Icon },
  { label: "Clients", mobileLabel: "Clients", to: "/op/clients", icon: UserGroupIcon },
  { label: "Factures", mobileLabel: "Factures", to: "/op/invoices", icon: Invoice01Icon },
  { label: "Paramètres", mobileLabel: "Réglages", to: "/op/settings", icon: Setting07Icon },
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

  const headerEnd =
    chrome.headerEnd ?? (
      <>
        <OperatorCommandPaletteHeaderTrigger className="md:hidden" />
        <p className="text-muted-foreground hidden text-sm sm:block">{email}</p>
        <a
          href="/api/auth/sign-out"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Déconnexion
        </a>
      </>
    );

  return (
    <OperatorCommandPaletteProvider>
      <DashboardChrome
        brand={{
          initials: "HZ",
          title: "Hezaerd",
          subtitle: "Opérateur",
        }}
        headerTitle={headerTitle}
        headerStart={chrome.headerStart}
        headerEnd={headerEnd}
        subHeader={chrome.subHeader}
        email={email}
        sidebarTop={<OperatorCommandPaletteTrigger />}
        mobileBottomNav={chrome.mobileBottomNav ?? <OperatorMobileBottomNav />}
        nav={navItems.map((item) => (
          <NavItemLink key={item.to} item={item} />
        ))}
      >
        <OperatorCommandPalette />
        {children}
      </DashboardChrome>
    </OperatorCommandPaletteProvider>
  );
}

function OperatorMobileBottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <BottomNav>
      {navItems.map((item) => (
        <BottomNavItem
          key={item.to}
          render={<Link to={item.to} />}
          isActive={
            item.to === "/op"
              ? pathname === "/op" || pathname === "/op/"
              : pathname.startsWith(item.to as string)
          }
          icon={<HugeiconsIcon icon={item.icon} size={20} className="shrink-0" />}
          label={item.mobileLabel}
        />
      ))}
    </BottomNav>
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
