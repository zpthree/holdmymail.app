import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const NON_AUTH_ROUTES = [
  "/",
  "/inbox/decluttering-your-inbox",
  "/inbox/hold-my-link",
  "/inbox/screenshots-from-the-app",
];

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const token = cookies.get("hmm_token");

  // if not logged in, redirect to login
  if (!token && !NON_AUTH_ROUTES.includes(url.pathname)) {
    throw redirect(303, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
  }

  return {};
};
