<script lang="ts">
  import { authApi } from "$lib/api";
  import { setAuth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);
  let unverified = $state(false);
  let resent = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";
    unverified = false;
    resent = false;
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
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.toLowerCase().includes("verify your email")) {
        unverified = true;
      }
      error = msg;
    } finally {
      loading = false;
    }
  }

  async function resendVerification() {
    if (!email) return;
    try {
      await authApi.resendVerification(email);
      resent = true;
    } catch {
      // silent
    }
  }
</script>

<h1>Login</h1>

<form onsubmit={handleSubmit}>
  {#if error}
    <p class="error">
      {error}
      {#if unverified && !resent}
        <button type="button" class="link-btn" onclick={resendVerification}
          >Resend verification email</button
        >
      {/if}
      {#if resent}
        <span class="resent">✓ Verification email sent!</span>
      {/if}
    </p>
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
    {loading ? "Logging in..." : "Login"}
  </button>
</form>

<a href="/auth/register" class="btn btn-white">Create an account</a>
<p class="links centered">
  <a href="/auth/forgot-password">Forgot password?</a>
</p>

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

  .link-btn {
    display: inline;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: var(--accent);
    font-size: inherit;
    text-decoration: underline;

    &:hover {
      color: var(--black);
    }
  }

  .btn-white {
    margin-top: 1rem;
  }

  .resent {
    display: block;
    margin-top: 0.5rem;
    color: #006600;
  }

  .links {
    margin-top: 1rem;
  }
</style>
