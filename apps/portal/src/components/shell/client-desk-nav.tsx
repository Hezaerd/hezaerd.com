import {
  File01Icon,
  Globe02Icon,
  Home01Icon,
  Invoice01Icon,
  PieChart01Icon,
  Setting07Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link, useRouterState } from "@tanstack/react-router";

type ClientDeskNavProps = {
  clientId: string;
  showSite?: boolean;
};

type DeskSection = {
  label: string;
  segment: "" | "invoices" | "files" | "insights" | "site" | "settings";
  icon: IconSvgElement;
};

const deskSectionsBase: DeskSection[] = [
  { label: "Bureau", segment: "", icon: Home01Icon },
  { label: "Factures", segment: "invoices", icon: Invoice01Icon },
  { label: "Fichiers", segment: "files", icon: File01Icon },
  { label: "Statistiques", segment: "insights", icon: PieChart01Icon },
];

const siteSection: DeskSection = { label: "Site", segment: "site", icon: Globe02Icon };
const settingsSection: DeskSection = { label: "Paramètres", segment: "settings", icon: Setting07Icon };

export function ClientDeskNav({ clientId, showSite = false }: ClientDeskNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const deskSections = [
    ...deskSectionsBase,
    ...(showSite ? [siteSection] : []),
    settingsSection,
  ];

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
