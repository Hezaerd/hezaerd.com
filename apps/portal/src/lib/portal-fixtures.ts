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
        title: "Invoice #1042 is unpaid",
        description: "Monthly retainer — due in 5 days.",
        clientId: "river-cafe",
        area: "invoices",
        kind: "invoice",
      },
      {
        id: "river-logo",
        title: "Logo SVG requested",
        description: "Upload a vector logo for the website refresh.",
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
        title: "Invoice #1038 is unpaid",
        description: "Website launch milestone — pay to continue.",
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
