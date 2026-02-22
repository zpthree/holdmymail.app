<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { page } from "$app/state";
  import Header from "$lib/components/Header.svelte";
  import MobileMenu from "$lib/components/MobileMenu.svelte";
  import { subscribeToUnread, unsubscribeFromUnread } from "$lib/stores/inbox";
  import { onDestroy } from "svelte";

  let { children, data } = $props();

  let isMobileMenuOpen = $state(false);
  const isHomepage = $derived(page.url.pathname === "/");
  const isInboxPreviewPage = $derived(
    page.url.pathname === "/inbox/decluttering-your-inbox" ||
      page.url.pathname === "/inbox/hold-my-link" ||
      page.url.pathname === "/inbox/screenshots-from-the-app",
  );
  const hasAuthToken = $derived(Boolean($auth.token || data.token));
  const activeUserId = $derived($auth.user?.id || data.user?.id || null);

  // Subscribe to unread inbox count via Convex live query
  $effect(() => {
    const userId = activeUserId;
    if (userId) {
      subscribeToUnread(userId);
    }
  });

  onDestroy(() => {
    unsubscribeFromUnread();
  });
</script>

<Header bind:isMobileMenuOpen gravatarUrl={data.gravatarUrl} />
<MobileMenu bind:isMobileMenuOpen />

{#if $auth.loading && !hasAuthToken && !isHomepage && !isInboxPreviewPage}
  <div class="loading">Loading...</div>
{:else if hasAuthToken}
  <main id="app">{@render children()}</main>
{:else if isHomepage || isInboxPreviewPage}
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
