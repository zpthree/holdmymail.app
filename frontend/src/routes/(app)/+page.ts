import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (browser) {
    const token = localStorage.getItem("token");
    throw redirect(303, token ? "/digests" : "/auth/login");
  }
  throw redirect(303, "/auth/login");
};
