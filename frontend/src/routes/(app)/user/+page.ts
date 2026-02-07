import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (browser) {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      throw redirect(302, `/user/${username}`);
    }
  }
  throw redirect(302, "/auth/login");
};
