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

/** Client view for Portal UI — `id` is the public slug used in routes. */
export type PortalClient = {
  id: string;
  name: string;
  contactEmail: string;
  features: Record<ClientFeature, boolean>;
};

export type PracticeCockpitStats = {
  openInvoiceTotal: number;
  paidThisMonth: number;
  clientsWaiting: number;
  activeClients: number;
};

export function toPortalClient(client: {
  slug: string;
  name: string;
  contactEmail: string;
  features: Record<ClientFeature, boolean>;
}): PortalClient {
  return {
    id: client.slug,
    name: client.name,
    contactEmail: client.contactEmail,
    features: client.features,
  };
}
