<script lang="ts">
  import { auth, setAuth } from "$lib/stores/auth";
  import { authApi } from "$lib/api";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import "$lib/assets/css/main.css";

  let { children } = $props();

  onMount(async () => {
    // Try to restore session from token
    const token = browser ? localStorage.getItem("token") : null;
    const userId = browser ? localStorage.getItem("userId") : null;

    if (token && userId) {
      try {
        const user = await authApi.getUser(userId, token);
        setAuth(
          {
            id: user.id,
            email: user.email,
            username: user.username,
            timezone:
              user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          token,
        );
      } catch {
        // Token invalid, clear auth
        setAuth(null, null);
      }
    } else {
      setAuth(null, null);
    }
  });
</script>

<Header />

<main id="main">{@render children()}</main>
