/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as clientInvites from "../clientInvites.js";
import type * as clients from "../clients.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as invoiceCheckout from "../invoiceCheckout.js";
import type * as invoiceInternal from "../invoiceInternal.js";
import type * as invoices from "../invoices.js";
import type * as lib_clientCascade from "../lib/clientCascade.js";
import type * as lib_clients from "../lib/clients.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_invoices from "../lib/invoices.js";
import type * as lib_users from "../lib/users.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clientInvites: typeof clientInvites;
  clients: typeof clients;
  health: typeof health;
  http: typeof http;
  invoiceCheckout: typeof invoiceCheckout;
  invoiceInternal: typeof invoiceInternal;
  invoices: typeof invoices;
  "lib/clientCascade": typeof lib_clientCascade;
  "lib/clients": typeof lib_clients;
  "lib/functions": typeof lib_functions;
  "lib/invoices": typeof lib_invoices;
  "lib/users": typeof lib_users;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workOSAuthKit: import("@convex-dev/workos-authkit/_generated/component.js").ComponentApi<"workOSAuthKit">;
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
};
