import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "site health checks",
  { minutes: 5 },
  internal.sitesInternal.runHealthChecks,
  {},
);

export default crons;
