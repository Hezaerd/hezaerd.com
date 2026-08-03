import { api } from "@hezaerd/backend/api";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference, FunctionReturnType } from "convex/server";

let client: ConvexHttpClient | null = null;

export function getConvex(): ConvexHttpClient {
  if (!client) {
    const url = process.env.CONVEX_URL;
    if (!url) {
      throw new Error("CONVEX_URL is required");
    }
    client = new ConvexHttpClient(url);
  }
  return client;
}

export function marionServiceSecret(): string {
  const secret = process.env.MARION_SERVICE_SECRET;
  if (!secret) {
    throw new Error("MARION_SERVICE_SECRET is required");
  }
  return secret;
}

type ActionArgs<F extends FunctionReference<"action">> = Omit<
  F extends FunctionReference<"action", "public", infer Args> ? Args : never,
  "serviceSecret"
>;

export async function marionAction<F extends FunctionReference<"action">>(
  ref: F,
  args: ActionArgs<F>,
): Promise<FunctionReturnType<F>> {
  return getConvex().action(ref, {
    ...args,
    serviceSecret: marionServiceSecret(),
  } as F extends FunctionReference<"action", "public", infer Args> ? Args : never);
}

export { api };
