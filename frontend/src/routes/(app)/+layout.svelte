<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { liveData } from "$lib/stores/stream";
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";

  let { children } = $props();

  // Redirect to login if not authenticated
  $effect(() => {
    if (!$auth.loading && !$auth.token) {
      goto("/auth/login");
    }
  });

  // Connect SSE stream when authenticated
  $effect(() => {
    if ($auth.token) {
      liveData.connect($auth.token);
    } else {
      liveData.disconnect();
    }
  });

  onDestroy(() => {
    liveData.disconnect();
  });
</script>

{#if $auth.loading}
  <div class="loading">Loading...</div>
{:else if $auth.token}
  {@render children()}
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
