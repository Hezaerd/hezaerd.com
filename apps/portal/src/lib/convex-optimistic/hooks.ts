import { api } from "@hezaerd/backend/api";
import { useMutation } from "convex/react";

import { optimisticSetFeature } from "./clients";
import {
  optimisticCancelInvoice,
  optimisticMarkPaidBankWire,
  optimisticSendInvoice,
} from "./invoices";

export function useSetFeatureMutation() {
  return useMutation(api.clients.setFeature).withOptimisticUpdate(optimisticSetFeature);
}

export function useInvoiceMutations() {
  const sendInvoice = useMutation(api.invoices.send).withOptimisticUpdate(optimisticSendInvoice);
  const cancelInvoice = useMutation(api.invoices.cancel).withOptimisticUpdate(
    optimisticCancelInvoice,
  );
  const markPaidBankWire = useMutation(api.invoices.markPaidBankWire).withOptimisticUpdate(
    optimisticMarkPaidBankWire,
  );
  const createInvoice = useMutation(api.invoices.create);

  return {
    createInvoice,
    sendInvoice,
    cancelInvoice,
    markPaidBankWire,
  };
}
