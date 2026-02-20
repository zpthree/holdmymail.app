<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Header from "$lib/components/Header.svelte";
  import MobileMenu from "$lib/components/MobileMenu.svelte";
  import { subscribeToUnread, unsubscribeFromUnread } from "$lib/stores/inbox";
  import { onDestroy } from "svelte";

  let { children, data } = $props();

  let isMobileMenuOpen = $state(false);
  const isHomepage = $derived(page.url.pathname === "/");

  // Redirect to login if not authenticated
  $effect(() => {
    if (!$auth.loading && !$auth.token && !isHomepage) {
      goto("/auth/login");
    }
  });

  // Subscribe to unread inbox count via Convex live query
  $effect(() => {
    const userId = $auth.user?.id;
    if (userId) {
      subscribeToUnread(userId);
    }
  });

  onDestroy(() => {
    unsubscribeFromUnread();
  });
</script>

{#if $auth.loading && !isHomepage}
  <div class="loading">Loading...</div>
{:else if $auth.token}
  <Header bind:isMobileMenuOpen gravatarUrl={data.gravatarUrl} />
  <MobileMenu bind:isMobileMenuOpen />
  <main id="app">{@render children()}</main>
{:else if isHomepage}
  <main id="app">{@render children()}</main>
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
