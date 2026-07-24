import type { NeedsAttentionItem, NeedsAttentionKind } from "@/lib/portal-fixtures";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import {
  ArrowRight01Icon,
  DollarCircleIcon,
  File01Icon,
  Globe02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Link } from "@tanstack/react-router";

type NeedsAttentionListProps = {
  items: NeedsAttentionItem[];
};

type KindConfig = {
  icon: IconSvgElement;
  label: string;
  ctaLabel: string;
  accentClass: string;
  iconBgClass: string;
  iconColorClass: string;
};

const kindConfig: Record<NeedsAttentionKind, KindConfig> = {
  invoice: {
    icon: DollarCircleIcon,
    label: "Invoice",
    ctaLabel: "Pay now",
    accentClass: "border-l-primary/60",
    iconBgClass: "bg-primary/10",
    iconColorClass: "text-primary",
  },
  file: {
    icon: File01Icon,
    label: "File request",
    ctaLabel: "Upload file",
    accentClass: "border-l-border",
    iconBgClass: "bg-muted",
    iconColorClass: "text-muted-foreground",
  },
  website: {
    icon: Globe02Icon,
    label: "Website",
    ctaLabel: "Review changes",
    accentClass: "border-l-border",
    iconBgClass: "bg-muted",
    iconColorClass: "text-muted-foreground",
  },
  feature: {
    icon: SparklesIcon,
    label: "New feature",
    ctaLabel: "Explore",
    accentClass: "border-l-primary/40",
    iconBgClass: "bg-primary/10",
    iconColorClass: "text-primary",
  },
};

export function NeedsAttentionList({ items }: NeedsAttentionListProps) {
  if (items.length === 0) {
    return (
      <Empty className="border-border bg-muted/20 rounded-xl border py-12">
        <EmptyHeader>
          <EmptyTitle className="font-display text-base font-semibold tracking-tight">
            All clear.
          </EmptyTitle>
          <EmptyDescription className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Nothing needs your attention right now. You&apos;ll see action items here as your
            project progresses.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const config = kindConfig[item.kind];
        return (
          <div
            key={item.id}
            className={`border-border bg-muted/20 hover:bg-muted/40 group relative flex items-start gap-4 rounded-xl border border-l-2 px-4 py-4 transition-colors ${config.accentClass}`}
          >
            {/* Icon bubble */}
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconBgClass}`}
            >
              <HugeiconsIcon icon={config.icon} size={15} className={config.iconColorClass} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display truncate text-sm font-semibold tracking-tight">
                    {item.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <span className="text-muted-foreground bg-muted shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase">
                  {config.label}
                </span>
              </div>

              <Link
                to={`/w/$clientId/${item.area}`}
                params={{ clientId: item.clientId }}
                className="text-primary mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              >
                {config.ctaLabel}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
