<script lang="ts">
  import { authApi } from "$lib/api";
  import SEO from "$lib/components/SEO.svelte";

  let email = $state("");
  let submitted = $state(false);
  let loading = $state(false);
  let error = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      await authApi.forgotPassword(email);
      submitted = true;
    } catch (err) {
      error = err instanceof Error ? err.message : "Something went wrong";
    } finally {
      loading = false;
    }
  }
</script>

<SEO
  path="/auth/forgot-password"
  data={{
    meta_title: "Forgot Password",
    meta_description: "Reset your Hold My Mail account password.",
  }}
/>

<h1>Forgot Password</h1>

{#if submitted}
  <p class="success">
    If an account exists with that email, you'll receive a password reset link.
  </p>
  <a href="/auth/login" class="back">Back to login</a>
{:else}
  <form onsubmit={handleSubmit}>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <label>
      Email
      <input type="email" bind:value={email} required />
    </label>

    <button type="submit" disabled={loading} class="btn btn-accent">
      {loading ? "Sending..." : "Send Reset Link"}
    </button>
  </form>

  <p class="links">
    <a href="/auth/login">Back to login</a>
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
    border: 0.15rem solid oklch(from var(--text-color) 0.25 c h);
    border-radius: 4px;
    padding: 0.75rem;
    font-size: 1rem;
  }

  .links {
    margin-top: 1rem;
    text-align: center;
  }

  .back {
    display: block;
    text-align: center;
  }
</style>
