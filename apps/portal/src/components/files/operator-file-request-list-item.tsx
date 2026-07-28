import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
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
      className="border-border hover:bg-muted/30 group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-sm font-semibold tracking-tight">
          {entry.request.title}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {filledCount}/{entry.slots.length} fichiers · max {entry.request.maxFileSizeMb} Mo
        </p>
      </div>
      <span
        className={
          entry.isComplete
            ? "text-primary shrink-0 text-xs font-medium"
            : "text-muted-foreground shrink-0 text-xs font-medium"
        }
      >
        {progressLabel}
      </span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={14}
        className="text-muted-foreground shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}
