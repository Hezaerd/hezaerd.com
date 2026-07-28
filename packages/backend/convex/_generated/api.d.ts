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
import type * as fileStorage from "../fileStorage.js";
import type * as files from "../files.js";
import type * as filesInternal from "../filesInternal.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as invoiceCheckout from "../invoiceCheckout.js";
import type * as invoiceInternal from "../invoiceInternal.js";
import type * as invoices from "../invoices.js";
import type * as lib_clientCascade from "../lib/clientCascade.js";
import type * as lib_clients from "../lib/clients.js";
import type * as lib_fileSettings from "../lib/fileSettings.js";
import type * as lib_files from "../lib/files.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_invoices from "../lib/invoices.js";
import type * as lib_r2 from "../lib/r2.js";
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
  fileStorage: typeof fileStorage;
  files: typeof files;
  filesInternal: typeof filesInternal;
  health: typeof health;
  http: typeof http;
  invoiceCheckout: typeof invoiceCheckout;
  invoiceInternal: typeof invoiceInternal;
  invoices: typeof invoices;
  "lib/clientCascade": typeof lib_clientCascade;
  "lib/clients": typeof lib_clients;
  "lib/fileSettings": typeof lib_fileSettings;
  "lib/files": typeof lib_files;
  "lib/functions": typeof lib_functions;
  "lib/invoices": typeof lib_invoices;
  "lib/r2": typeof lib_r2;
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
