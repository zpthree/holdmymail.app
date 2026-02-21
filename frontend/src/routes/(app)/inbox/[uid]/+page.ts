import { emailApi, type Email } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, url, parent }) => {
  const { token } = await parent();
  if (!token)
    return { email: null as Email | null, from: null as string | null };

  // get email
  const email = await emailApi.get(params.uid, token);

  // get "from" query parameter - used to make back link dynamic
  const from = url.searchParams.get("from");

  return { email, from };
};
