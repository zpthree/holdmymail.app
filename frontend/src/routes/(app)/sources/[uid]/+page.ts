import { browser } from "$app/environment";
import { senderApi, emailApi, type Sender, type Email } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  if (!browser) return { sender: null as Sender | null, emails: [] as Email[] };

  const token = localStorage.getItem("token");
  if (!token) return { sender: null as Sender | null, emails: [] as Email[] };

  const [sender, allEmails] = await Promise.all([
    senderApi.get(params.uid, token),
    emailApi.list(token),
  ]);

  const emails = allEmails.filter(
    (e) => e.senderId === params.uid || e.fromEmail === sender.email,
  );

  return { sender, emails };
};
