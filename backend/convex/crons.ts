import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "deliver scheduled emails",
  { hours: 1 },
  internal.emails.deliverDueEmails,
);

export default crons;
