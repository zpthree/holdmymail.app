<script lang="ts">
  import { authApi } from "$lib/api";
  import { setAuth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      const { token, userId } = await authApi.login(email, password);
      const user = await authApi.getUser(userId, token);
      setAuth(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          timezone:
            user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        token,
      );
      goto("/");
    } catch (err) {
      error = err instanceof Error ? err.message : "Login failed";
    } finally {
      loading = false;
    }
  }
</script>

<h1>Login</h1>

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
    {loading ? "Logging in..." : "Login"}
  </button>
</form>

<p class="links">
  <a href="/auth/register">Create an account</a>
  <a href="/auth/forgot-password">Forgot password?</a>
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
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    text-align: center;
  }

  a {
    color: #0066cc;
  }
</style>
