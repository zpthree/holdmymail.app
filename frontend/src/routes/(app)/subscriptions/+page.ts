import { browser } from "$app/environment";
import { senderApi, type Sender } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (!browser) return { senders: [] as Sender[] };

  const token = localStorage.getItem("token");
  if (!token) return { senders: [] as Sender[] };

  const senders = await senderApi.list(token);
  return { senders };
};
