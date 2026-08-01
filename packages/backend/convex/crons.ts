import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "purge stale analytics sessions",
  { minutes: 15 },
  internal.analyticsCrons.purgeStaleSessions,
);

crons.daily(
  "purge old analytics visitor days",
  { hourUTC: 8, minuteUTC: 0 },
  internal.analyticsCrons.purgeOldVisitorDays,
);

export default crons;
