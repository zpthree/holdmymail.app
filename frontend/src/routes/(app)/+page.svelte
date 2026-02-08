<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
  path="/"
  data={{
    meta_title: "Hold My Mail",
    meta_description: "Welcome to Hold My Mail",
  }}
/>

<main>
  <h1>Welcome to Hold My Mail</h1>
  {#if $auth.user}
    <p>Logged in as {$auth.user.email}</p>
  {/if}
</main>

<style>
  main {
    padding: 2rem;
  }
</style>
