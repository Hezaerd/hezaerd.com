import { Setting07Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/settings")({
  component: OperatorSettingsPage,
});

function OperatorSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Setting07Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Practice configuration and preferences — coming soon.
        </p>
      </div>

      <div className="border-border bg-muted/10 flex flex-col items-center justify-center gap-2 rounded-xl border py-16 text-center">
        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
          <HugeiconsIcon icon={Setting07Icon} size={18} className="text-muted-foreground" />
        </div>
        <p className="font-display mt-1 text-sm font-semibold tracking-tight">Nothing here yet</p>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Practice-level settings — billing, branding, and notifications — will live here.
        </p>
      </div>
    </div>
  );
}
