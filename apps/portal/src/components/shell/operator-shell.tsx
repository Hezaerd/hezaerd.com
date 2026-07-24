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
  { label: "Home", to: "/op", icon: Home01Icon },
  { label: "Clients", to: "/op/clients", icon: UserGroupIcon },
  { label: "Invoices", to: "/op/invoices", icon: Invoice01Icon },
  { label: "Settings", to: "/op/settings", icon: Setting07Icon },
];

export function OperatorShell({ email, children }: OperatorShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <DashboardChrome
      brand={{
        initials: "HZ",
        title: "Hezaerd",
        subtitle: "Operator",
      }}
      email={email}
      nav={navItems.map((item) => (
        <SidebarMenuItem key={item.to}>
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
      ))}
      footer={
        <div className="overflow-hidden px-3 py-2 transition-[opacity,height,padding] duration-200 ease-linear group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0">
          <p className="text-muted-foreground truncate font-mono text-[10px] tracking-wide whitespace-nowrap">
            Practice Operator
          </p>
        </div>
      }
    >
      {children}
    </DashboardChrome>
  );
}
