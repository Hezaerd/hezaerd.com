import { Button } from "@hezaerd/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hezaerd/ui/components/card";

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
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Website
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Guided editable fields — Preview before Publish.
        </p>
      </div>
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Hero blurb</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Draft copy ready for review — seasonal menu highlight.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Preview</Button>
            <Button>Publish</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
