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
  segment: "" | "invoices" | "files" | "insights" | "settings";
  icon: IconSvgElement;
};

const deskSections: DeskSection[] = [
  { label: "Bureau", segment: "", icon: Home01Icon },
  { label: "Factures", segment: "invoices", icon: Invoice01Icon },
  { label: "Fichiers", segment: "files", icon: File01Icon },
  { label: "Statistiques", segment: "insights", icon: PieChart01Icon },
  { label: "Paramètres", segment: "settings", icon: Setting07Icon },
];

export function ClientDeskNav({ clientId, className }: ClientDeskNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function isSectionActive(segment: DeskSection["segment"]) {
    const base = `/op/clients/${clientId}`;
    if (segment === "") {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname.startsWith(`${base}/${segment}`);
  }

  return (
    <nav
      className={[
        "border-border -mx-1 flex w-full items-center gap-0.5 overflow-x-auto border-b px-1 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
      })}
    </nav>
  );
}
