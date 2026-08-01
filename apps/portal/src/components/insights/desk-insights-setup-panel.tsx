import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@hezaerd/ui/components/dialog";
import { cn } from "@hezaerd/ui/lib/utils";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { useId, useState } from "react";

import { CopyField } from "@/components/copy/copy-field";
import { DeskCard } from "@/components/shell/client-desk-layout";
import { analyticsSiteForDeskQueryKey } from "@/lib/convex-queries";
import { getAnalyticsCollectUrls } from "@/lib/convex-site-url";

type DeskInsightsSetupPanelProps = {
  clientId: string;
  site: {
    siteKey: string;
    ingestSecret: string;
    productionUrl: string;
  };
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

function collectHost(productionUrl: string) {
  try {
    return new URL(productionUrl).host;
  } catch {
    return productionUrl;
  }
}

export function DeskInsightsSetupPanel({
  clientId,
  site,
  collapsible = true,
  defaultOpen = false,
  className,
}: DeskInsightsSetupPanelProps) {
  const panelId = useId();
  const queryClient = useQueryClient();
  const rotateSiteKeys = useMutation(api.analytics.rotateSiteKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  const { browser, server } = getAnalyticsCollectUrls();
  const siteHost = collectHost(site.productionUrl);

  async function confirmRotate() {
    setRotating(true);
    setRotateError(null);
    try {
      await rotateSiteKeys({ slug: clientId });
      await queryClient.invalidateQueries({ queryKey: analyticsSiteForDeskQueryKey(clientId) });
      setDialogOpen(false);
    } catch (error) {
      setRotateError(error instanceof Error ? error.message : "Régénération impossible.");
    } finally {
      setRotating(false);
    }
  }

  const setupFields = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Endpoints et clés pour @hezaerd/analytics · {siteHost}
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                Regénérer les clés
              </Button>
            }
          />
          <DialogContent showCloseButton={!rotating}>
            <DialogHeader>
              <DialogTitle>Regénérer les clés ?</DialogTitle>
              <DialogDescription>
                Le siteKey public et l&apos;ingestSecret serveur seront remplacés. Mets à jour les
                variables d&apos;environnement du site client et redéploie.
              </DialogDescription>
            </DialogHeader>
            {rotateError ? <p className="text-destructive text-sm">{rotateError}</p> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={rotating}
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="button" disabled={rotating} onClick={() => void confirmRotate()}>
                {rotating ? "Régénération…" : "Regénérer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4">
        <CopyField id={`${panelId}-collect-browser`} label="Collect URL (browser)" value={browser} />
        <CopyField id={`${panelId}-collect-server`} label="Server collect URL" value={server} />
        <CopyField
          id={`${panelId}-site-key`}
          label="siteKey"
          value={site.siteKey}
          description="Public — bundle client (VITE_ / NEXT_PUBLIC_)."
        />
        <CopyField
          id={`${panelId}-ingest-secret`}
          label="ingestSecret"
          value={site.ingestSecret}
          description="Server only — ne pas commit. Bearer token pour /collect/server."
        />
      </div>
    </>
  );

  if (!collapsible) {
    return (
      <DeskCard className={className}>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-semibold tracking-tight">Collecte</h3>
          <p className="text-muted-foreground text-sm">Configuration SDK pour {siteHost}</p>
        </div>
        <div className="flex flex-col gap-4">{setupFields}</div>
      </DeskCard>
    );
  }

  return (
    <DeskCard className={cn("gap-0 overflow-hidden p-0", className)}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 px-5 py-4 text-left",
          "transition-[background-color,transform] duration-[var(--duration-press)] ease-out motion-reduce:transition-none",
          "hover:bg-muted/30 active:scale-[0.995]",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold tracking-tight">Collecte</h3>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">
            {open ? "URLs et clés SDK" : siteHost}
          </p>
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id={panelId} className="overflow-hidden" aria-hidden={!open}>
          <div
            className={cn(
              "border-border flex flex-col gap-4 border-t px-5 pb-5 pt-4",
              "transition-opacity duration-200 ease-out motion-reduce:transition-none",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            {setupFields}
          </div>
        </div>
      </div>
    </DeskCard>
  );
}
