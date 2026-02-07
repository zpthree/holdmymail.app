<script lang="ts">
  import { authApi } from "$lib/api";
  import { goto } from "$app/navigation";

  let email = $state("");
  let username = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    loading = true;

    try {
      await authApi.register(email, password, username);
      goto("/auth/login?registered=true");
    } catch (err) {
      error = err instanceof Error ? err.message : "Registration failed";
    } finally {
      loading = false;
    }
  }
</script>

<h1>Create Account</h1>

<form onsubmit={handleSubmit}>
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <label>
    Username
    <input type="text" bind:value={username} required />
    <span class="hint"
      >This will be your email address: {username ||
        "username"}@inbox.holdmymail.app</span
    >
  </label>

  <label>
    Email
    <input type="email" bind:value={email} required />
  </label>

  <label>
    Password
    <input type="password" bind:value={password} required minlength="8" />
  </label>

  <label>
    Confirm Password
    <input type="password" bind:value={confirmPassword} required />
  </label>

  <button type="submit" disabled={loading}>
    {loading ? "Creating account..." : "Create Account"}
  </button>
</form>

<p class="links">
  Already have an account? <a href="/auth/login">Login</a>
</p>

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
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.75rem;
    font-size: 1rem;
  }

  .hint {
    color: #666;
    font-weight: normal;
    font-size: 0.85rem;
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: #0066cc;
    padding: 0.75rem;
    color: white;
    font-size: 1rem;
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

  .links {
    margin-top: 1rem;
    text-align: center;
  }

  a {
    color: #0066cc;
  }
</style>
