import { api } from "@hezaerd/backend/api";
import type { OptimisticLocalStore } from "convex/browser";

type SetFeatureArgs = {
  slug: string;
  feature: "insights" | "cms";
  enabled: boolean;
};

function patchClientFeatures(
  localStore: OptimisticLocalStore,
  slug: string,
  feature: SetFeatureArgs["feature"],
  enabled: boolean,
) {
  const client = localStore.getQuery(api.clients.getBySlug, { slug });
  if (client) {
    localStore.setQuery(api.clients.getBySlug, { slug }, {
      ...client,
      features: {
        ...client.features,
        [feature]: enabled,
      },
    });
  }

  const list = localStore.getQuery(api.clients.list, {});
  if (list) {
    localStore.setQuery(
      api.clients.list,
      {},
      list.map((entry) =>
        entry.slug === slug
          ? {
              ...entry,
              features: {
                ...entry.features,
                [feature]: enabled,
              },
            }
          : entry,
      ),
    );
  }
}

export function optimisticSetFeature(localStore: OptimisticLocalStore, args: SetFeatureArgs) {
  patchClientFeatures(localStore, args.slug, args.feature, args.enabled);
}
