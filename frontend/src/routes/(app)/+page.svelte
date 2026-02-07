<script lang="ts">
  import { auth } from "$lib/stores/auth";
</script>

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
