import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { authApi } from "$lib/api";

export const actions: Actions = {
  register: async ({ request }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !username || !password) {
      return fail(400, {
        error: "Username, email, and password are required",
        email,
        username,
      });
    }

    try {
      await authApi.register(email, password, username);
      return {
        registered: true,
        email,
      };
    } catch (err) {
      return fail(400, {
        error: err instanceof Error ? err.message : "Registration failed",
        email,
        username,
      });
    }
  },
  resendVerification: async ({ request }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      return fail(400, {
        error: "Enter your email first",
      });
    }

    try {
      await authApi.resendVerification(email);
      return {
        registered: true,
        resent: true,
        email,
      };
    } catch {
      return fail(400, {
        error: "Could not resend verification email",
        registered: true,
        email,
      });
    }
  },
};
