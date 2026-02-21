<script lang="ts">
  import { authApi } from "$lib/api";
  import { browser } from "$app/environment";
  import {
    AUTH_TOKEN_COOKIE,
    AUTH_USER_ID_COOKIE,
    readCookie,
  } from "$lib/auth-cookies";
  import { onMount } from "svelte";
  import SEO from "$lib/components/SEO.svelte";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);
  let success = $state(false);

  // If already logged in, mint a separate token for the extension
  onMount(async () => {
    if (!browser) return;

    const token = readCookie(AUTH_TOKEN_COOKIE);
    const userId = readCookie(AUTH_USER_ID_COOKIE);

    if (token && userId) {
      try {
        // Create an independent token so the extension and web app don't share one
        const { token: extToken, userId: extUserId } =
          await authApi.mintToken(token);
        completeAuth(extToken, extUserId);
      } catch {
        // Token invalid — fall through to login form
      }
    }
  });

  function completeAuth(token: string, userId: string) {
    success = true;
    // Put the token in the URL — the extension's background worker detects this
    const url = new URL(window.location.href);
    url.searchParams.set("hmm_token", token);
    url.searchParams.set("hmm_user", userId);
    // Use assign so the browser actually navigates (triggers chrome.tabs.onUpdated)
    window.location.assign(url.toString());
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      const { token, userId } = await authApi.login(email, password);
      completeAuth(token, userId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Login failed";
    } finally {
      loading = false;
    }
  }
</script>

<SEO
  path="/auth/extension-callback"
  data={{
    meta_title: "Connect Extension",
    meta_description:
      "Connect the Hold My Mail Chrome extension to your account.",
  }}
/>

<h1>Connect Extension</h1>

{#if success}
  <p class="info">Connected! This tab will close automatically…</p>
{:else}
  <p class="info">
    Sign in to connect the Hold My Mail Chrome extension to your account.
  </p>

  <form onsubmit={handleSubmit}>
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <label>
      Email
      <input type="email" bind:value={email} required />
    </label>

    <label>
      Password
      <input type="password" bind:value={password} required />
    </label>

    <button type="submit" disabled={loading} class="btn btn-black">
      {loading ? "Connecting..." : "Connect"}
    </button>
  </form>
{/if}

<style>
  h1 {
    margin-bottom: 0;
  }

  .info {
    margin-bottom: 1.5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-weight: 500;
  }

  input {
    border: 0.15rem solid oklch(from var(--text-color) 0.25 c h);
    border-radius: 4px;
    padding: 0.75rem;
    font-size: 1rem;
  }
</style>
