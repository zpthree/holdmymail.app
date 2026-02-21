import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { token, user } = await parent();
  if (token && user?.username) {
    throw redirect(302, `/user/${user.username}`);
  }

  throw redirect(302, "/auth/login");
};
