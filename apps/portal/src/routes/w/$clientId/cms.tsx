import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { clientBySlugQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/w/$clientId/cms")({
  component: ClientCmsPage,
});

function ClientCmsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null || !clientDoc.features.cms) {
    throw redirect({
      to: "/w/$clientId",
      params: { clientId },
    });
  }

  return <CmsContent />;
}

function CmsContent() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Mon site</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Champs guidés — prévisualisez vos changements avant de publier.
        </p>
      </div>
    </div>
  );
}
