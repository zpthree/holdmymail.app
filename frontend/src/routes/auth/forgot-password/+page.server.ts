import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { authApi } from "$lib/api";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      return fail(400, {
        error: "Email is required",
      });
    }

    try {
      await authApi.forgotPassword(email);
      return {
        submitted: true,
        email,
      };
    } catch (err) {
      return fail(400, {
        error: err instanceof Error ? err.message : "Something went wrong",
        email,
      });
    }
  },
};
