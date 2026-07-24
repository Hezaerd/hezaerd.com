import { Button } from "@hezaerd/ui/components/button";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
            Contacter Hezaerd
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Laissez une note — pas un ticket support. Court et direct, c&apos;est mieux.
        </p>
      </div>

      {/* Message form */}
      <div className="border-border bg-muted/20 flex flex-col gap-0 overflow-hidden rounded-xl border">
        <div className="border-border border-b px-5 py-3">
          <p className="font-display text-sm font-semibold tracking-tight">Nouveau message</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Votre note apparaîtra dans les signaux de travail de Hezaerd.
          </p>
        </div>

        <div className="px-5 py-4">
          <textarea
            id="message-body"
            aria-label="Message à Hezaerd"
            className="border-border bg-background placeholder:text-muted-foreground/60 focus:ring-ring min-h-36 w-full resize-none rounded-lg border px-3.5 py-3 text-sm leading-relaxed focus:ring-1 focus:outline-none"
            placeholder="Que doit savoir Hezaerd ?"
          />
        </div>

        <div className="border-border bg-muted/10 flex items-center justify-between gap-3 border-t px-5 py-3">
          <p className="text-muted-foreground text-xs">
            Réponse en général sous 1 jour ouvré.
          </p>
          <Button size="sm">
            <HugeiconsIcon icon={Message01Icon} size={13} />
            Envoyer le message
          </Button>
        </div>
      </div>
    </div>
  );
}
