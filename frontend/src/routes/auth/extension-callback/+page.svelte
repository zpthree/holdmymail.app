<script lang="ts">
  import { authApi } from "$lib/api";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);
  let success = $state(false);

  // If already logged in, mint a separate token for the extension
  onMount(async () => {
    if (!browser) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

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

    <button type="submit" disabled={loading}>
      {loading ? "Connecting..." : "Connect"}
    </button>
  </form>
{/if}

<style>
  h1 {
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .info {
    margin-bottom: 1.5rem;
    color: #666;
    font-size: 0.9rem;
    text-align: center;
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
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.75rem;
    font-size: 1rem;
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: #1a1a1a;
    padding: 0.75rem;
    color: white;
    font-weight: 600;
    font-size: 1rem;
  }

  button:hover {
    opacity: 0.85;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    border-radius: 4px;
    background: #ffeeee;
    padding: 0.75rem;
    color: #cc0000;
  }
</style>
