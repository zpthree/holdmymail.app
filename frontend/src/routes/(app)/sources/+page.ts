import { senderApi, type Sender } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { token } = await parent();
  if (!token) return { senders: [] as Sender[] };

  const senders = await senderApi.list(token);
  return { senders };
};
