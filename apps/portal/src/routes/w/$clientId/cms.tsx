import { useEffect } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { api } from "@hezaerd/backend/api";
import { useMutation } from "convex/react";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { CmsWorkspaceContent } from "@/components/cms/cms-workspace-content";
import { clientBySlugQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/w/$clientId/cms")({
  component: ClientCmsPage,
});

function ClientCmsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const acknowledgeFeatureUnlock = useMutation(api.cms.acknowledgeFeatureUnlock);

  useEffect(() => {
    void acknowledgeFeatureUnlock({ slug: clientId });
  }, [acknowledgeFeatureUnlock, clientId]);

  if (clientDoc === null || !clientDoc.features.cms) {
    throw redirect({
      to: "/w/$clientId",
      params: { clientId },
    });
  }

  return <CmsWorkspaceContent clientId={clientId} />;
}
