<script lang="ts">
  import { authApi } from "$lib/api";

  let email = $state("");
  let username = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);
  let registered = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    loading = true;

    try {
      await authApi.register(email, password, username);
      registered = true;
    } catch (err) {
      error = err instanceof Error ? err.message : "Registration failed";
    } finally {
      loading = false;
    }
  }
</script>

{#if registered}
  <h1>Check your email</h1>
  <p class="success">
    We sent a verification link to <strong>{email}</strong>. Click the link in
    the email to activate your account.
  </p>
  <p class="hint centered">
    Didn't get the email? Check your spam folder or <button
      class="link-btn"
      onclick={() => {
        authApi.resendVerification(email);
      }}>resend it</button
    >.
  </p>
  <p class="links">
    <a href="/auth/login">Back to login</a>
  </p>
{:else}
  <h1>Create Account</h1>

  <form onsubmit={handleSubmit}>
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <label>
      Username
      <input type="text" bind:value={username} required />
      <span class="hint"
        >This <u>cannot</u> be changed later. This will be your email address: {username ||
          "username"}@inbox.holdmymail.app.</span
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

    <button type="submit" disabled={loading} class="btn btn-black">
      {loading ? "Creating account..." : "Create Account"}
    </button>
  </form>

  <p class="links">
    Already have an account? <a href="/auth/login">Login</a>
  </p>
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

  .hint {
    color: #666;
    font-weight: normal;
    font-size: 0.85rem;
  }

  .centered {
    text-align: center;
  }

  .links {
    margin-top: 1rem;
    text-align: center;
  }
</style>
