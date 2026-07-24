import { Message01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@hezaerd/ui/components/button";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/message")({
  component: ClientMessagePage,
});

function ClientMessagePage() {
  return (
    <div className="flex max-w-xl flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Message01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Message Hezaerd
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Leave a note — not a helpdesk ticket. Short and direct works best.
        </p>
      </div>

      {/* Message form */}
      <div className="border-border bg-muted/20 flex flex-col gap-0 overflow-hidden rounded-xl border">
        <div className="border-border border-b px-5 py-3">
          <p className="font-display text-sm font-semibold tracking-tight">
            New message
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Your note will surface in Hezaerd&apos;s work cues.
          </p>
        </div>

        <div className="px-5 py-4">
          <textarea
            id="message-body"
            aria-label="Message to Hezaerd"
            className="border-border bg-background placeholder:text-muted-foreground/60 w-full resize-none rounded-lg border px-3.5 py-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring min-h-36"
            placeholder="What should Hezaerd know?"
          />
        </div>

        <div className="border-border flex items-center justify-between gap-3 border-t bg-muted/10 px-5 py-3">
          <p className="text-muted-foreground text-xs">
            Response typically within 1 business day.
          </p>
          <Button size="sm">
            <HugeiconsIcon icon={Message01Icon} size={13} />
            Send message
          </Button>
        </div>
      </div>
    </div>
  );
}
