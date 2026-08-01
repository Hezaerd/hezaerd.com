/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as analyticsCollect from "../analyticsCollect.js";
import type * as analyticsHttp from "../analyticsHttp.js";
import type * as analyticsSites from "../analyticsSites.js";
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
import type * as lib_analytics_constants from "../lib/analytics/constants.js";
import type * as lib_analytics_dayKey from "../lib/analytics/dayKey.js";
import type * as lib_analytics_insightsOverview from "../lib/analytics/insightsOverview.js";
import type * as lib_analytics_origin from "../lib/analytics/origin.js";
import type * as lib_analytics_paths from "../lib/analytics/paths.js";
import type * as lib_analytics_period from "../lib/analytics/period.js";
import type * as lib_analytics_rollups from "../lib/analytics/rollups.js";
import type * as lib_analytics_secrets from "../lib/analytics/secrets.js";
import type * as lib_analytics_siteKey from "../lib/analytics/siteKey.js";
import type * as lib_analytics_sourceKind from "../lib/analytics/sourceKind.js";
import type * as lib_analytics_visitor from "../lib/analytics/visitor.js";
import type * as lib_clientCascade from "../lib/clientCascade.js";
import type * as lib_clients from "../lib/clients.js";
import type * as lib_fileSettings from "../lib/fileSettings.js";
import type * as lib_files from "../lib/files.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_invoices from "../lib/invoices.js";
import type * as lib_linkedSite from "../lib/linkedSite.js";
import type * as lib_r2 from "../lib/r2.js";
import type * as lib_users from "../lib/users.js";
import type * as linkedSite from "../linkedSite.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  analyticsCollect: typeof analyticsCollect;
  analyticsHttp: typeof analyticsHttp;
  analyticsSites: typeof analyticsSites;
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
  "lib/analytics/constants": typeof lib_analytics_constants;
  "lib/analytics/dayKey": typeof lib_analytics_dayKey;
  "lib/analytics/insightsOverview": typeof lib_analytics_insightsOverview;
  "lib/analytics/origin": typeof lib_analytics_origin;
  "lib/analytics/paths": typeof lib_analytics_paths;
  "lib/analytics/period": typeof lib_analytics_period;
  "lib/analytics/rollups": typeof lib_analytics_rollups;
  "lib/analytics/secrets": typeof lib_analytics_secrets;
  "lib/analytics/siteKey": typeof lib_analytics_siteKey;
  "lib/analytics/sourceKind": typeof lib_analytics_sourceKind;
  "lib/analytics/visitor": typeof lib_analytics_visitor;
  "lib/clientCascade": typeof lib_clientCascade;
  "lib/clients": typeof lib_clients;
  "lib/fileSettings": typeof lib_fileSettings;
  "lib/files": typeof lib_files;
  "lib/functions": typeof lib_functions;
  "lib/invoices": typeof lib_invoices;
  "lib/linkedSite": typeof lib_linkedSite;
  "lib/r2": typeof lib_r2;
  "lib/users": typeof lib_users;
  linkedSite: typeof linkedSite;
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
