import { writable } from "svelte/store";
import { browser } from "$app/environment";

interface User {
  id: string;
  email: string;
  username: string;
  timezone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: browser ? localStorage.getItem("token") : null,
  loading: true,
};

export const auth = writable<AuthState>(initialState);

export function setAuth(user: User | null, token: string | null) {
  if (browser) {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("timezone", user.timezone || "");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
    }
  }
  auth.set({ user, token, loading: false });
}

export function clearAuth() {
  if (browser) {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("timezone");
  }
  auth.set({ user: null, token: null, loading: false });
}
