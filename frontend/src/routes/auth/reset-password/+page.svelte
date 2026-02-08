<script lang="ts">
  import { page } from "$app/stores";
  import { authApi } from "$lib/api";

  let password = $state("");
  let error = $state("");
  let success = $state(false);
  let loading = $state(false);

  const token = $derived($page.url.searchParams.get("token"));

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (!token) {
      error = "Invalid reset link";
      return;
    }

    loading = true;

    try {
      await authApi.resetPassword(token, password);
      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to reset password";
    } finally {
      loading = false;
    }
  }
</script>

<h1>Reset Password</h1>

{#if success}
  <p class="success">Your password has been reset.</p>
  <a href="/auth/login" class="back">Login with new password</a>
{:else if !token}
  <p class="error">Invalid or expired reset link.</p>
  <a href="/auth/forgot-password" class="back">Request a new link</a>
{:else}
  <form onsubmit={handleSubmit}>
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <label>
      New Password
      <input type="password" bind:value={password} required minlength="8" />
    </label>

    <button type="submit" disabled={loading} class="btn btn-black">
      {loading ? "Resetting..." : "Reset Password"}
    </button>
  </form>
{/if}

<style>
  h1 {
    margin-bottom: 1rem;
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
  .back {
    display: block;
    text-align: center;
  }
</style>
