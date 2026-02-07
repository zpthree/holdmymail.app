import { browser } from "$app/environment";
import { digestApi, type Digest } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  if (!browser) return { digest: null as Digest | null };

  const token = localStorage.getItem("token");
  if (!token) return { digest: null as Digest | null };

  try {
    const digest = await digestApi.get(params.uid, token);
    return { digest };
  } catch {
    return { digest: null as Digest | null };
  }
};
