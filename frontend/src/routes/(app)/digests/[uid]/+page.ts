import { dev } from "$app/environment";
import { digestApi, type Digest } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent }) => {
  const { token } = await parent();
  if (!token) return { digest: null as Digest | null };

  try {
    let digest = await digestApi.get(params.uid, token);

    // In development, replace production URLs with local dev URLs
    if (dev && digest.htmlBody) {
      digest.htmlBody = digest.htmlBody.replace(
        /https:\/\/www.holdmymail\.app/g,
        "",
      );
    }

    return { digest };
  } catch {
    return { digest: null as Digest | null };
  }
};
