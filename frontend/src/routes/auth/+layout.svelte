<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";

  let { children } = $props();

  // Redirect to home if already logged in (skip for logout page)
  $effect(() => {
    if (
      !$auth.loading &&
      $auth.token &&
      window.location.pathname !== "/auth/logout"
    ) {
      goto("/");
    }
  });
</script>

{#if $auth.loading || $auth.token}
  <div class="loading"></div>
{:else}
  <div class="auth-layout">
    <div class="auth-container">
      {@render children()}
    </div>
  </div>
{/if}

<style>
  .auth-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
    min-height: 100vh;
  }

  .auth-container {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background: white;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
</style>
