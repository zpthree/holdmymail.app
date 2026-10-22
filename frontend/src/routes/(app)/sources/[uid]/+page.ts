import { senderApi, type Sender, type EmailSummary } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent }) => {
  const { token } = await parent();
  if (!token)
    return { sender: null as Sender | null, emails: [] as EmailSummary[] };

  const [sender, emails] = await Promise.all([
    senderApi.get(params.uid, token),
    senderApi.listEmails(params.uid, token),
  ]);

  return { sender, emails };
};
