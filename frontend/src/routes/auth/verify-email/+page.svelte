<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

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

    // TODO: Implement email verification API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success = true;
    verifying = false;
  });
</script>

<h1>Verify Email</h1>

{#if verifying}
  <p>Verifying your email...</p>
{:else if success}
  <p class="success">Your email has been verified!</p>
  <a href="/auth/login" class="back">Continue to login</a>
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
    margin-top: 1rem;
    color: #0066cc;
  }
</style>
