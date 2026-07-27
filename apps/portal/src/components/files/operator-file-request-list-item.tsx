import { Badge } from "@hezaerd/ui/components/badge";
import { ArrowRight01Icon, File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Link } from "@tanstack/react-router";

import type { FileRequestEntry } from "@/lib/portal-types";

type OperatorFileRequestListItemProps = {
  clientId: string;
  entry: FileRequestEntry;
};

export function OperatorFileRequestListItem({ clientId, entry }: OperatorFileRequestListItemProps) {
  const filledCount = entry.slots.length - entry.pendingCount;
  const progressLabel = entry.isComplete ? "Reçue" : "En attente";

  return (
    <Link
      to="/op/clients/$clientId/files/$requestId"
      params={{ clientId, requestId: entry.request._id }}
      className="border-border bg-muted/20 hover:bg-muted/40 group flex items-start gap-4 rounded-xl border px-4 py-4 transition-colors"
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          entry.isComplete ? "bg-primary/10" : "bg-muted"
        }`}
      >
        <HugeiconsIcon
          icon={File01Icon}
          size={16}
          className={entry.isComplete ? "text-primary" : "text-muted-foreground"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display truncate text-sm font-semibold tracking-tight">
              {entry.request.title}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {filledCount}/{entry.slots.length} fichiers · max {entry.request.maxFileSizeMb} Mo
            </p>
          </div>
          <Badge variant={entry.isComplete ? "default" : "secondary"}>{progressLabel}</Badge>
        </div>
        <span className="text-primary mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
          Voir la demande
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
