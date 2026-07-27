import { Badge } from "@hezaerd/ui/components/badge";
import { File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Link } from "@tanstack/react-router";

import type { FileRequestEntry } from "@/lib/portal-types";

type FileRequestDetailHeaderProps = {
  entry: FileRequestEntry;
  backTo: "/w/$clientId/files" | "/op/clients/$clientId/files";
  backParams: { clientId: string };
  backLabel: string;
};

export function FileRequestDetailHeader({
  entry,
  backTo,
  backParams,
  backLabel,
}: FileRequestDetailHeaderProps) {
  const filledCount = entry.slots.length - entry.pendingCount;

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={backTo}
        params={backParams}
        className="text-muted-foreground hover:text-foreground w-fit text-xs font-medium transition-colors"
      >
        ← {backLabel}
      </Link>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={File01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{entry.request.title}</h1>
          <Badge variant={entry.isComplete ? "default" : "secondary"}>
            {entry.isComplete ? "Complet" : `${filledCount}/${entry.slots.length} reçus`}
          </Badge>
        </div>
        {entry.request.instructions ? (
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            {entry.request.instructions}
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          Max {entry.request.maxFileSizeMb} Mo par fichier
        </p>
      </div>
    </div>
  );
}
