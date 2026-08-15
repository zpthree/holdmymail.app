import { ingestInboundEmail, type InboundPayload } from "../inbound/ingest";

const POSTMARK_API = "https://api.postmarkapp.com";
const PAGE_SIZE = 500;

interface InboundSearchHit {
  MessageID: string;
  Status?: string;
}

interface ReplayOptions {
  fromdate?: string;
  todate?: string;
}

export interface ReplaySummary {
  scanned: number;
  stored: number;
  duplicate: number;
  unknownRecipient: number;
  invalid: number;
  errors: number;
}

function postmarkToken() {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) {
    throw new Error("POSTMARK_SERVER_TOKEN environment variable is required");
  }
  return token;
}

async function postmarkGet<T>(path: string): Promise<T> {
  const res = await fetch(`${POSTMARK_API}${path}`, {
    headers: {
      Accept: "application/json",
      "X-Postmark-Server-Token": postmarkToken(),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Postmark ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

async function listInboundIds(options: ReplayOptions): Promise<string[]> {
  const ids = new Set<string>();
  const statuses = ["processed", "failed", "queued"];

  for (const status of statuses) {
    let offset = 0;
    while (true) {
      const params = new URLSearchParams({
        count: String(PAGE_SIZE),
        offset: String(offset),
        status,
      });
      if (options.fromdate) params.set("fromdate", options.fromdate);
      if (options.todate) params.set("todate", options.todate);

      const data = await postmarkGet<{
        TotalCount: number;
        InboundMessages: InboundSearchHit[];
      }>(`/messages/inbound?${params.toString()}`);

      const page = data.InboundMessages || [];
      for (const msg of page) {
        if (msg.MessageID) ids.add(msg.MessageID);
      }

      offset += page.length;
      if (page.length < PAGE_SIZE || offset >= data.TotalCount || offset >= 10000) {
        break;
      }
    }
  }

  return [...ids];
}

export async function replayInboundFromPostmark(
  options: ReplayOptions = {},
): Promise<ReplaySummary> {
  const summary: ReplaySummary = {
    scanned: 0,
    stored: 0,
    duplicate: 0,
    unknownRecipient: 0,
    invalid: 0,
    errors: 0,
  };

  const ids = await listInboundIds(options);
  summary.scanned = ids.length;

  for (const id of ids) {
    try {
      const details = await postmarkGet<InboundPayload>(
        `/messages/inbound/${id}/details`,
      );
      const result = await ingestInboundEmail(details);
      if (result.status === "stored") summary.stored++;
      else if (result.status === "duplicate") summary.duplicate++;
      else if (result.status === "unknown_recipient") summary.unknownRecipient++;
      else summary.invalid++;
    } catch (err) {
      summary.errors++;
      console.error(`replayInbound failed for ${id}:`, err);
    }
  }

  return summary;
}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

if (import.meta.main) {
  const { connectMongo } = await import("../db");
  await connectMongo();
  const summary = await replayInboundFromPostmark({
    fromdate: argValue("from"),
    todate: argValue("to"),
  });
  console.log("replayInbound", summary);
  process.exit(0);
}
