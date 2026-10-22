import { redirect } from "@sveltejs/kit";
import { adminApi, type AdminUser } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { token, user } = await parent();
  if (!token || !user) {
    throw redirect(302, "/auth/login");
  }
  if (!user.isAdmin) {
    throw redirect(302, "/");
  }

  try {
    return {
      users: await adminApi.listUsers(token),
      usersError: "",
    };
  } catch (error) {
    return {
      users: [] as AdminUser[],
      usersError:
        error instanceof Error ? error.message : "Unable to load users",
    };
  }
};
