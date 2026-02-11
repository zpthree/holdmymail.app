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
    background-color: var(--bg-color-2);
    padding: 2rem;
    width: 100%;
    max-width: 400px;

    @media (prefers-color-scheme: dark) {
      /* background-color: var(--bg-color); */
    }

    @media screen and (width > 480px) {
      border: 0.3rem solid var(--text-color);

      @media (prefers-color-scheme: dark) {
        /* border-color: var(--bg-color-2); */
      }
    }
  }

  #logo {
    margin: auto;
  }

  #logo span {
    padding: 0.5rem 1rem;
    color: var(--white);

    @media (prefers-color-scheme: light) {
      background-color: var(--black);
    }
  }

  #logo :global(svg) {
    width: auto;
    height: 4rem;
  }
</style>
