<script lang="ts">
  import "$lib/assets/css/main.css";
  import { setAuth } from "$lib/stores/auth";
  import { authApi } from "$lib/api";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(async () => {
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
        setAuth(null, null);
      }
    } else {
      setAuth(null, null);
    }
  });
</script>

{@render children()}
