<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { page } from "$app/state";
  import SEO from "$lib/components/SEO.svelte";

  let loading = $state(false);
  let { form } = $props();
  const next = $derived(form?.next || page.url.searchParams.get("next") || "");
</script>

<SEO
  path="/auth/login"
  data={{
    meta_title: "Login",
    meta_description: "Sign in to your Hold My Mail account.",
  }}
/>

<h1>Login</h1>

<form
  method="POST"
  action="?/login"
  use:enhance={() => {
    loading = true;
    return async ({ result }) => {
      await applyAction(result);
      loading = false;
    };
  }}
>
  {#if form?.error || form?.resent}
    <p class={form?.error ? "error" : ""}>
      {#if form?.error}
        {form.error}
      {/if}
      {#if form?.unverified && !form?.resent}
        <button
          type="submit"
          class="link-btn"
          formaction="?/resendVerification"
          >Resend verification email</button
        >
      {/if}
      {#if form?.resent}
        <span class="resent">✓ Verification email sent!</span>
      {/if}
    </p>
  {/if}

  <label>
    Email
    <input type="email" name="email" value={form?.email || ""} required />
  </label>

  <input type="hidden" name="next" value={next} />

  <label>
    Password
    <input type="password" name="password" required />
  </label>

  <button type="submit" disabled={loading} class="btn btn-accent">
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
    border: 0.15rem solid oklch(from var(--text-color) 0.25 c h);
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
      color: var(--text-color);
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
