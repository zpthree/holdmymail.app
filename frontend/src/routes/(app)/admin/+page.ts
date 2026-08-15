import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { token, user } = await parent();
  if (!token || !user) {
    throw redirect(302, "/auth/login");
  }
  if (!user.isAdmin) {
    throw redirect(302, "/");
  }
  return {};
};
