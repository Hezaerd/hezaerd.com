import { api } from "@hezaerd/backend/api";
import type { Id } from "@hezaerd/backend/dataModel";
import type { OptimisticLocalStore } from "convex/browser";

type InvoiceStatus = "draft" | "open" | "paid" | "cancelled";

type InvoiceDoc = {
  _id: Id<"invoices">;
  _creationTime: number;
  clientId: Id<"clients">;
  number: number;
  label: string;
  amountCents: number;
  currency: "eur";
  status: InvoiceStatus;
  dueDate?: number;
  openedAt?: number;
  stripeCheckoutSessionId?: string;
  checkoutUrl?: string;
  checkoutExpiresAt?: number;
  payment?: {
    method: "stripe" | "bank_wire";
    paidAt: number;
    stripeSessionId?: string;
    transferRef?: string;
  };
};

type EnrichedInvoice = InvoiceDoc & {
  clientSlug: string;
  clientName: string;
};

type InvoiceLookup = {
  invoice: InvoiceDoc | EnrichedInvoice;
  clientSlug?: string;
};

function findInvoice(
  localStore: OptimisticLocalStore,
  invoiceId: Id<"invoices">,
): InvoiceLookup | null {
  const listAll = localStore.getQuery(api.invoices.listAll, {});
  if (listAll) {
    const invoice = listAll.find((entry) => entry._id === invoiceId);
    if (invoice) {
      return { invoice, clientSlug: invoice.clientSlug };
    }
  }

  for (const { args, value } of localStore.getAllQueries(api.invoices.listByClientSlug)) {
    if (!value) {
      continue;
    }
    const invoice = value.find((entry) => entry._id === invoiceId);
    if (invoice) {
      return { invoice, clientSlug: args.slug };
    }
  }

  for (const { args, value } of localStore.getAllQueries(api.invoices.listForWorkspace)) {
    if (!value) {
      continue;
    }
    const invoice = value.find((entry) => entry._id === invoiceId);
    if (invoice) {
      return { invoice, clientSlug: args.slug };
    }
  }

  return null;
}

function patchInvoiceLists(
  localStore: OptimisticLocalStore,
  invoiceId: Id<"invoices">,
  patch: Partial<InvoiceDoc>,
) {
  const listAll = localStore.getQuery(api.invoices.listAll, {});
  if (listAll) {
    localStore.setQuery(
      api.invoices.listAll,
      {},
      listAll.map((entry) => (entry._id === invoiceId ? { ...entry, ...patch } : entry)),
    );
  }

  for (const { args, value } of localStore.getAllQueries(api.invoices.listByClientSlug)) {
    if (!value) {
      continue;
    }
    localStore.setQuery(
      api.invoices.listByClientSlug,
      args,
      value.map((entry) => (entry._id === invoiceId ? { ...entry, ...patch } : entry)),
    );
  }

  for (const { args, value } of localStore.getAllQueries(api.invoices.listForWorkspace)) {
    if (!value) {
      continue;
    }
    localStore.setQuery(
      api.invoices.listForWorkspace,
      args,
      value.map((entry) => (entry._id === invoiceId ? { ...entry, ...patch } : entry)),
    );
  }
}

function syncWaitingAndNeedsAttention(
  localStore: OptimisticLocalStore,
  invoice: InvoiceDoc,
  clientSlug: string,
) {
  const isOpen = invoice.status === "open";

  for (const { args, value } of localStore.getAllQueries(api.invoices.listWaitingOnClient)) {
    if (!value || args.slug !== clientSlug) {
      continue;
    }

    if (isOpen) {
      if (value.some((item) => item.id === invoice._id)) {
        continue;
      }
      localStore.setQuery(api.invoices.listWaitingOnClient, args, [
        {
          id: invoice._id,
          title: `Facture n°${invoice.number}`,
          description: invoice.label,
          href: `/op/clients/${clientSlug}/invoices`,
        },
        ...value,
      ]);
      continue;
    }

    localStore.setQuery(
      api.invoices.listWaitingOnClient,
      args,
      value.filter((item) => item.id !== invoice._id),
    );
  }

  for (const { args, value } of localStore.getAllQueries(api.invoices.listNeedsAttention)) {
    if (!value || args.slug !== clientSlug) {
      continue;
    }

    if (isOpen) {
      if (value.some((item) => item.id === invoice._id)) {
        continue;
      }
      localStore.setQuery(api.invoices.listNeedsAttention, args, [
        {
          id: invoice._id,
          title: `Facture n°${invoice.number}`,
          description: invoice.label,
          clientId: clientSlug,
          area: "invoices",
          kind: "invoice",
        },
        ...value,
      ]);
      continue;
    }

    localStore.setQuery(
      api.invoices.listNeedsAttention,
      args,
      value.filter((item) => item.id !== invoice._id),
    );
  }
}

function syncClientStats(localStore: OptimisticLocalStore) {
  const listAll = localStore.getQuery(api.invoices.listAll, {});
  if (!listAll) {
    return;
  }

  const currentStats = localStore.getQuery(api.clients.stats, {});
  const clients = localStore.getQuery(api.clients.list, {});

  const openInvoices = listAll.filter((invoice) => invoice.status === "open");
  const paidInvoices = listAll.filter((invoice) => invoice.status === "paid");
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  localStore.setQuery(api.clients.stats, {}, {
    openInvoiceTotal: openInvoices.reduce((sum, invoice) => sum + invoice.amountCents, 0) / 100,
    paidThisMonth:
      paidInvoices
        .filter((invoice) => invoice.payment && invoice.payment.paidAt >= monthStart)
        .reduce((sum, invoice) => sum + invoice.amountCents, 0) / 100,
    clientsWaiting: new Set(openInvoices.map((invoice) => invoice.clientId)).size,
    activeClients: clients?.length ?? currentStats?.activeClients ?? 0,
  });
}

function applyInvoicePatch(
  localStore: OptimisticLocalStore,
  invoiceId: Id<"invoices">,
  patch: Partial<InvoiceDoc>,
) {
  const found = findInvoice(localStore, invoiceId);
  if (!found) {
    return;
  }

  patchInvoiceLists(localStore, invoiceId, patch);

  const updated = { ...found.invoice, ...patch };
  const clientSlug =
    found.clientSlug ??
    ("clientSlug" in found.invoice ? found.invoice.clientSlug : undefined);

  if (clientSlug) {
    syncWaitingAndNeedsAttention(localStore, updated, clientSlug);
  }

  syncClientStats(localStore);
}

const checkoutClearPatch = {
  stripeCheckoutSessionId: undefined,
  checkoutUrl: undefined,
  checkoutExpiresAt: undefined,
} as const;

export function optimisticSendInvoice(
  localStore: OptimisticLocalStore,
  args: { invoiceId: Id<"invoices"> },
) {
  applyInvoicePatch(localStore, args.invoiceId, {
    status: "open",
    openedAt: Date.now(),
  });
}

export function optimisticCancelInvoice(
  localStore: OptimisticLocalStore,
  args: { invoiceId: Id<"invoices"> },
) {
  applyInvoicePatch(localStore, args.invoiceId, {
    status: "cancelled",
    ...checkoutClearPatch,
  });
}

export function optimisticMarkPaidBankWire(
  localStore: OptimisticLocalStore,
  args: { invoiceId: Id<"invoices">; transferRef?: string },
) {
  applyInvoicePatch(localStore, args.invoiceId, {
    status: "paid",
    payment: {
      method: "bank_wire",
      paidAt: Date.now(),
      transferRef: args.transferRef?.trim() || undefined,
    },
    ...checkoutClearPatch,
  });
}
