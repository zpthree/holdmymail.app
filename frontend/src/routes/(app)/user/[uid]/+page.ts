import { browser } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { authApi } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  if (!browser) return { user: null };

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  if (!token || !userId) return { user: null };

  // Only allow users to view their own page
  if (params.uid !== username) {
    throw redirect(302, `/user/${username}`);
  }

  try {
    const user = await authApi.getUser(userId, token);
    return { user };
  } catch {
    return { user: null };
  }
};
