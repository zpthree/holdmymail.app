<script lang="ts">
  import { page } from "$app/stores";
  import { authApi } from "$lib/api";
  import { onMount } from "svelte";
  import SEO from "$lib/components/SEO.svelte";

  let verifying = $state(true);
  let success = $state(false);
  let error = $state("");

  const token = $derived($page.url.searchParams.get("token"));

  onMount(async () => {
    if (!token) {
      error = "Invalid verification link";
      verifying = false;
      return;
    }

    try {
      await authApi.verifyEmail(token);
      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : "Verification failed";
    } finally {
      verifying = false;
    }
  });
</script>

<SEO
  path="/auth/verify-email"
  data={{
    meta_title: "Verify Email",
    meta_description: "Verify your Hold My Mail email address.",
  }}
/>

<h1>Verify Email</h1>

{#if verifying}
  <p>Verifying your email...</p>
{:else if success}
  <p class="success">Your email has been verified! You can now log in.</p>
  <a href="/auth/login" class="btn btn-black">Continue to login</a>
{:else}
  <p class="error">{error}</p>
  <a href="/auth/login" class="back">Back to login</a>
{/if}

<style>
  h1 {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .error {
    border-radius: 4px;
    background: #ffeeee;
    padding: 0.75rem;
    color: #cc0000;
  }

  .success {
    margin-bottom: 1rem;
    border-radius: 4px;
    background: #eeffee;
    padding: 1rem;
    color: #006600;
  }

  .back {
    display: block;
    margin-top: 1rem;
    color: #0066cc;
    text-align: center;
  }

  /* .btn {
    display: block;
    transition:
      background-color 200ms ease-in-out,
      color 200ms ease-in-out;
    cursor: pointer;
    border: none;
    border: 0.2rem solid var(--text-color);
    border-radius: var(--br-full);
    padding: 0.75rem;
    font-size: 1rem;
    text-align: center;
    text-decoration: none;
  }

  .btn-black {
    background-color: var(--text-color);
    color: var(--white);

    &:hover {
      background-color: hsl(from var(--text-color) h s l / 0.75);
    }
  } */
</style>
