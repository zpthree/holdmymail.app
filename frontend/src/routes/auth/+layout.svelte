<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import Logo from "$lib/components/Logo.svelte";

  let { children } = $props();

  const SKIP_REDIRECT = ["/auth/logout", "/auth/extension-callback"];

  // Redirect to home if already logged in (skip for logout & extension callback)
  $effect(() => {
    if (
      !$auth.loading &&
      $auth.token &&
      !SKIP_REDIRECT.includes(window.location.pathname)
    ) {
      goto("/");
    }
  });
</script>

<main id="auth">
  {#if $auth.loading || ($auth.token && !SKIP_REDIRECT.includes(window.location.pathname))}
    <div class="loading"></div>
  {:else}
    <div class="auth-layout centered">
      <div class="auth-container">
        <a href="/auth/login" id="logo" class="centered"
          ><span><Logo /></span></a
        >
        {@render children()}
      </div>
    </div>
  {/if}
</main>

<style>
  .auth-layout {
    min-height: 100vh;
  }

  .auth-container {
    border-radius: 8px;
    background: white;
    padding: 2rem;
    width: 100%;
    max-width: 400px;

    @media screen and (width > 480px) {
      border: 0.3rem solid var(--text-color);
    }
  }

  #logo {
    margin: auto;
  }

  #logo span {
    background-color: var(--text-color);
    padding: 0.5rem 1rem;
    color: var(--white);
  }

  #logo :global(svg) {
    width: auto;
    height: 4rem;
  }
</style>
