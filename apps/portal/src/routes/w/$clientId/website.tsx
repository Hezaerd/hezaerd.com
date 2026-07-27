import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { clientBySlugQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/w/$clientId/website")({
  component: ClientWebsitePage,
});

function ClientWebsitePage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null || !clientDoc.features.website) {
    throw redirect({
      to: "/w/$clientId",
      params: { clientId },
    });
  }

  return <WebsiteContent />;
}

function WebsiteContent() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Site web</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Champs guidés — prévisualisez vos changements avant de publier.
        </p>
      </div>
    </div>
  );
}
