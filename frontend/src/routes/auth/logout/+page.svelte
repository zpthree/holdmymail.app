<script lang="ts">
  import { authApi } from "$lib/api";
  import { auth, clearAuth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(async () => {
    if ($auth.token) {
      try {
        await authApi.logout($auth.token);
      } catch {
        // Ignore logout errors
      }
    }
    clearAuth();
    goto("/auth/login");
  });
</script>

<p>Logging out...</p>
