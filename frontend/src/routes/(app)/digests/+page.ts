import { browser } from "$app/environment";
import { digestApi, type Digest } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (!browser) return { digests: [] as Digest[] };

  const token = localStorage.getItem("token");
  if (!token) return { digests: [] as Digest[] };

  const digests = await digestApi.list(token);
  return { digests };
};
