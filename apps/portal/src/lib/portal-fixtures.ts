export type ClientFeature = "insights" | "website";

export type NeedsAttentionKind = "invoice" | "file" | "website" | "feature";

export type NeedsAttentionArea = "invoices" | "files" | "website" | "insights";

export type NeedsAttentionItem = {
  id: string;
  title: string;
  description: string;
  clientId: string;
  area: NeedsAttentionArea;
  kind: NeedsAttentionKind;
};

export type PortalClient = {
  id: string;
  name: string;
  contactEmail: string;
  features: Record<ClientFeature, boolean>;
  needsAttention: NeedsAttentionItem[];
};

export type PracticeCockpitStats = {
  openInvoiceTotal: number;
  paidThisMonth: number;
  clientsWaiting: number;
  activeClients: number;
};

const clients: PortalClient[] = [
  {
    id: "river-cafe",
    name: "River Cafe",
    contactEmail: "owner@rivercafe.example",
    features: {
      insights: true,
      website: true,
    },
    needsAttention: [
      {
        id: "river-invoice-1042",
        title: "La facture n°1042 est impayée",
        description: "Forfait mensuel — échéance dans 5 jours.",
        clientId: "river-cafe",
        area: "invoices",
        kind: "invoice",
      },
      {
        id: "river-logo",
        title: "Logo SVG demandé",
        description: "Envoyez un logo vectoriel pour la refonte du site.",
        clientId: "river-cafe",
        area: "files",
        kind: "file",
      },
    ],
  },
  {
    id: "northside-yoga",
    name: "Northside Yoga",
    contactEmail: "studio@northsideyoga.example",
    features: {
      insights: false,
      website: false,
    },
    needsAttention: [
      {
        id: "northside-invoice-1038",
        title: "La facture n°1038 est impayée",
        description: "Jalon de lancement du site — payez pour continuer.",
        clientId: "northside-yoga",
        area: "invoices",
        kind: "invoice",
      },
    ],
  },
];

export const practiceCockpit: PracticeCockpitStats = {
  openInvoiceTotal: 4200,
  paidThisMonth: 6800,
  clientsWaiting: 2,
  activeClients: 2,
};

export function listClients(): PortalClient[] {
  return clients;
}

export function getClient(clientId: string): PortalClient | undefined {
  return clients.find((client) => client.id === clientId);
}

export function getFirstClient(): PortalClient {
  return clients[0]!;
}

function featureUnlockItem(clientId: string, feature: ClientFeature): NeedsAttentionItem {
  return {
    id: `${clientId}-${feature}-unlock`,
    title:
      feature === "website"
        ? "Le site web est prêt à explorer"
        : "Les statistiques sont prêtes à explorer",
    description:
      feature === "website"
        ? "Relisez les champs modifiables et publiez quand vous êtes prêt."
        : "Consultez les visiteurs, les pages populaires et un enseignement clair.",
    clientId,
    area: feature,
    kind: "feature",
  };
}

export function setClientFeature(
  clientId: string,
  feature: ClientFeature,
  enabled: boolean,
): PortalClient | undefined {
  const client = getClient(clientId);
  if (!client) {
    return undefined;
  }

  client.features[feature] = enabled;

  const unlockId = `${clientId}-${feature}-unlock`;
  if (enabled) {
    if (!client.needsAttention.some((item) => item.id === unlockId)) {
      client.needsAttention.push(featureUnlockItem(clientId, feature));
    }
  } else {
    client.needsAttention = client.needsAttention.filter((item) => item.id !== unlockId);
  }

  return client;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
