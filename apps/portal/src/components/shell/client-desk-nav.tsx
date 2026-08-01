import { BottomNav, BottomNavItem } from "@hezaerd/ui/components/bottom-nav";
import {
  File01Icon,
  Home01Icon,
  Invoice01Icon,
  PieChart01Icon,
  Setting07Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

type ClientDeskNavProps = {
  clientId: string;
  className?: string;
};

type DeskSection = {
  label: string;
  mobileLabel: string;
  segment: "" | "invoices" | "files" | "insights" | "settings";
  icon: IconSvgElement;
};

const deskSections: DeskSection[] = [
  { label: "Bureau", mobileLabel: "Bureau", segment: "", icon: Home01Icon },
  { label: "Factures", mobileLabel: "Factures", segment: "invoices", icon: Invoice01Icon },
  { label: "Fichiers", mobileLabel: "Fichiers", segment: "files", icon: File01Icon },
  {
    label: "Statistiques",
    mobileLabel: "Stats",
    segment: "insights",
    icon: PieChart01Icon,
  },
  { label: "Paramètres", mobileLabel: "Réglages", segment: "settings", icon: Setting07Icon },
];

function useDeskSectionActive(clientId: string, segment: DeskSection["segment"]) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const base = `/op/clients/${clientId}`;
  if (segment === "") {
    return pathname === base || pathname === `${base}/`;
  }
  return pathname.startsWith(`${base}/${segment}`);
}

export function ClientDeskNav({ clientId, className }: ClientDeskNavProps) {
  return (
    <nav
      className={[
        "border-border -mx-1 hidden w-full items-center gap-0.5 overflow-x-auto border-b px-1 pb-px [-ms-overflow-style:none] [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {deskSections.map((section) => (
        <DeskNavLink key={section.label} clientId={clientId} section={section} />
      ))}
    </nav>
  );
}

export function ClientDeskMobileBottomNav({ clientId }: { clientId: string }) {
  return (
    <BottomNav>
      {deskSections.map((section) => (
        <DeskBottomNavItem key={section.label} clientId={clientId} section={section} />
      ))}
    </BottomNav>
  );
}

function DeskNavLink({ clientId, section }: { clientId: string; section: DeskSection }) {
  const active = useDeskSectionActive(clientId, section.segment);

  return (
    <Link
      to={
        section.segment === ""
          ? "/op/clients/$clientId"
          : `/op/clients/$clientId/${section.segment}`
      }
      params={{ clientId }}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-3",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      <HugeiconsIcon icon={section.icon} size={14} className="shrink-0" />
      <span>{section.label}</span>
    </Link>
  );
}

function DeskBottomNavItem({ clientId, section }: { clientId: string; section: DeskSection }) {
  const active = useDeskSectionActive(clientId, section.segment);

  return (
    <BottomNavItem
      render={
        <Link
          to={
            section.segment === ""
              ? "/op/clients/$clientId"
              : `/op/clients/$clientId/${section.segment}`
          }
          params={{ clientId }}
        />
      }
      isActive={active}
      icon={<HugeiconsIcon icon={section.icon} size={20} className="shrink-0" />}
      label={section.mobileLabel}
    />
  );
}
