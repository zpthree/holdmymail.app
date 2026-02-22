<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import SEO from "$lib/components/SEO.svelte";

  let email = $state("");
  let loading = $state(false);
  let { form } = $props();

  $effect(() => {
    if (form?.email) email = form.email;
  });
</script>

<SEO
  path="/auth/forgot-password"
  data={{
    meta_title: "Forgot Password",
    meta_description: "Reset your Hold My Mail account password.",
  }}
/>

<h1>Forgot Password</h1>

{#if form?.submitted}
  <p class="success">
    If an account exists with that email, you'll receive a password reset link.
  </p>
  <a href="/auth/login" class="back">Back to login</a>
{:else}
  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        await applyAction(result);
        loading = false;
      };
    }}
  >
    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}
    <label>
      Email
      <input type="email" name="email" bind:value={email} required />
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
