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
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { useState } from "react";

import { CopyField } from "@/components/copy/copy-field";
import { DeskCard, DeskCardHeader, DeskSectionHeading } from "@/components/shell/client-desk-layout";
import { analyticsSiteForDeskQueryKey } from "@/lib/convex-queries";
import { getAnalyticsCollectUrls } from "@/lib/convex-site-url";

type DeskInsightsSetupPanelProps = {
  clientId: string;
  site: {
    siteKey: string;
    ingestSecret: string;
    productionUrl: string;
  };
};

export function DeskInsightsSetupPanel({ clientId, site }: DeskInsightsSetupPanelProps) {
  const queryClient = useQueryClient();
  const rotateSiteKeys = useMutation(api.analytics.rotateSiteKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const { browser, server } = getAnalyticsCollectUrls();

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

  return (
    <div className="flex flex-col gap-6">
      <DeskCard>
        <DeskCardHeader
          title="Collecte"
          description="URLs et clés pour brancher @hezaerd/analytics sur le site client."
          action={
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
                    Le siteKey public et l&apos;ingestSecret serveur seront remplacés. Mets à jour
                    les variables d&apos;environnement du site client et redéploie.
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
          }
        />

        <div className="flex flex-col gap-4">
          <CopyField id="collect-browser-url" label="Collect URL (browser)" value={browser} />
          <CopyField id="collect-server-url" label="Server collect URL" value={server} />
          <CopyField id="site-key" label="siteKey" value={site.siteKey} description="Public — bundle client (VITE_ / NEXT_PUBLIC_)." />
          <CopyField
            id="ingest-secret"
            label="ingestSecret"
            value={site.ingestSecret}
            description="Server only — ne pas commit. Bearer token pour /collect/server."
          />
        </div>
      </DeskCard>

      <section className="flex flex-col gap-3">
        <DeskSectionHeading title="Aperçu" />
        <DeskCard className="items-center py-10 text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Les graphiques arrivent — la collecte est active.
          </p>
        </DeskCard>
      </section>
    </div>
  );
}
