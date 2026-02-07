<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let success = $state(false);
  let loading = $state(false);

  const token = $derived($page.url.searchParams.get("token"));

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    if (!token) {
      error = "Invalid reset link";
      return;
    }

    loading = true;

    // TODO: Implement reset password API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success = true;
    loading = false;
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

    <label>
      Confirm Password
      <input type="password" bind:value={confirmPassword} required />
    </label>

    <button type="submit" disabled={loading}>
      {loading ? "Resetting..." : "Reset Password"}
    </button>
  </form>
{/if}

<style>
  h1 {
    margin-bottom: 1.5rem;
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
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    color: #cc0000;
    background: #ffeeee;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .success {
    background: #eeffee;
    color: #006600;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .back {
    display: block;
    text-align: center;
    color: #0066cc;
  }
</style>
