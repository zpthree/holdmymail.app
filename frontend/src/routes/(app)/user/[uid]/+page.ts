import { redirect } from "@sveltejs/kit";
import { authApi } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent }) => {
  const { token, user } = await parent();
  if (!token || !user) {
    throw redirect(302, "/auth/login");
  }

  // Only allow users to view their own page
  if (params.uid !== user.username) {
    throw redirect(302, `/user/${user.username}`);
  }

  try {
    const fullUser = await authApi.getUser(user.id, token);
    return { user: fullUser };
  } catch {
    throw redirect(302, "/auth/login");
  }
};
