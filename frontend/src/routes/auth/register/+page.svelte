<script lang="ts">
  import { enhance } from "$app/forms";
  import SEO from "$lib/components/SEO.svelte";

  let email = $state("");
  let username = $state("");
  let loading = $state(false);
  let { form } = $props();

  $effect(() => {
    if (form?.email) email = form.email;
    if (form?.username) username = form.username;
  });
</script>

<SEO
  path="/auth/register"
  data={{
    meta_title: "Create Account",
    meta_description:
      "Create a Hold My Mail account to manage your email inbox.",
  }}
/>

{#if form?.registered}
  <h1>Check your email</h1>
  <p class="success">
    We sent a verification link to <strong>{form?.email || email}</strong>.
    Click the link in the email to activate your account.
  </p>
  <p class="hint centered">Didn't get the email? Check your spam folder.</p>
  <form method="POST" use:enhance class="centered">
    <input type="hidden" name="email" value={form?.email || ""} />
    <button class="btn btn-black" formaction="?/resendVerification"
      >Resend verification email</button
    >
  </form>
  {#if form?.resent}
    <p class="success centered">✓ Verification email sent!</p>
  {/if}
  <p class="links">
    <a href="/auth/login">Back to login</a>
  </p>
{:else}
  <h1>Create Account</h1>

  <form
    method="POST"
    action="?/register"
    use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        await update();
        loading = false;
      };
    }}
  >
    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}

    <label>
      Username
      <input type="text" name="username" bind:value={username} required />
      <span class="hint"
        >This <u>cannot</u> be changed later. This will be your email address: {username ||
          "username"}@inbox.holdmymail.app.</span
      >
    </label>

    <label>
      Email
      <input type="email" name="email" bind:value={email} required />
    </label>

    <label>
      Password
      <input type="password" name="password" required minlength="8" />
    </label>

    <button type="submit" disabled={loading} class="btn btn-accent">
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
    border: 0.15rem solid oklch(from var(--text-color) 0.25 c h);
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

  .btn-black {
    padding-inline: 2.5rem;
  }
</style>
