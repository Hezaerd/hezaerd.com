import {
  File01Icon,
  Globe02Icon,
  Home01Icon,
  Invoice01Icon,
  PieChart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

type ClientDeskNavProps = {
  clientId: string;
};

type DeskSection = {
  label: string;
  segment: "" | "invoices" | "files" | "website" | "insights";
  icon: IconSvgElement;
};

const deskSections: DeskSection[] = [
  { label: "Bureau", segment: "", icon: Home01Icon },
  { label: "Factures", segment: "invoices", icon: Invoice01Icon },
  { label: "Fichiers", segment: "files", icon: File01Icon },
  { label: "Site web", segment: "website", icon: Globe02Icon },
  { label: "Statistiques", segment: "insights", icon: PieChart01Icon },
];

export function ClientDeskNav({ clientId }: ClientDeskNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function isSectionActive(segment: DeskSection["segment"]) {
    const base = `/op/clients/${clientId}`;
    if (segment === "") {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname.startsWith(`${base}/${segment}`);
  }

  return (
    <nav className="border-border -mx-4 flex items-center gap-1 border-b px-4 pb-0 md:-mx-6 md:px-6">
      {deskSections.map((section) => {
        const active = isSectionActive(section.segment);
        return (
          <Link
            key={section.label}
            to={
              section.segment === ""
                ? "/op/clients/$clientId"
                : `/op/clients/$clientId/${section.segment}`
            }
            params={{ clientId }}
            className={[
              "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <HugeiconsIcon icon={section.icon} size={14} className="shrink-0" />
            <span>{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
