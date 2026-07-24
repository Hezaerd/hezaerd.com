import { Button } from "@hezaerd/ui/components/button";
import { Edit01Icon, Globe02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { getClient } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/w/$clientId/website")({
  beforeLoad: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client?.features.website) {
      throw redirect({
        to: "/w/$clientId",
        params: { clientId: params.clientId },
      });
    }
  },
  component: ClientWebsitePage,
});

function ClientWebsitePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Globe02Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Website</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Guided editable fields — preview your changes before publishing.
        </p>
      </div>

      {/* Editable sections */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          Pending review
        </h2>

        {/* Hero blurb card */}
        <div className="border-border bg-muted/20 rounded-xl border">
          <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={Edit01Icon} size={14} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-tight">Hero blurb</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Homepage — main headline area
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
              Draft ready
            </span>
          </div>

          <div className="px-5 py-4">
            <div className="bg-muted/30 border-border rounded-lg border px-4 py-3">
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                &ldquo;Seasonal menus inspired by the river — dine with us this autumn.&rdquo;
              </p>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Seasonal menu highlight, drafted by Hezaerd for your review.
            </p>
          </div>

          <div className="border-border flex gap-2 border-t px-5 py-3">
            <Button variant="outline" size="sm">
              Preview
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </div>
      </section>

      {/* Published sections placeholder */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          Published
        </h2>
        <div className="border-border bg-muted/10 flex flex-col items-center justify-center gap-2 rounded-xl border py-10 text-center">
          <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
            <HugeiconsIcon icon={Globe02Icon} size={16} className="text-muted-foreground" />
          </div>
          <p className="font-display text-sm font-semibold tracking-tight">Nothing published yet</p>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Once you approve and publish changes, they&apos;ll appear here for reference.
          </p>
        </div>
      </section>
    </div>
  );
}
