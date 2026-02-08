<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import type { Digest } from "$lib/api";

  let { data } = $props();
  let digest = $derived<Digest | null>(data.digest);

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: $auth.user?.timezone || undefined,
    });
  }
</script>

<div class="digest-container">
  <nav>
    <a href="/digests" class="back">← Back to Digests</a>
  </nav>

  {#if digest}
    <header>
      <p class="meta">
        {formatDate(digest.sentAt)}
      </p>
      <h1 style="font-size: var(--fs-xl)">{digest.subject}</h1>
    </header>

    <article>
      <div class="body">
        {@html digest.htmlBody}
      </div>
    </article>
  {:else}
    <div class="error">Digest not found</div>
  {/if}
</div>

<style>
  .digest-container {
    margin: 0 auto;
    padding: 2rem 0.5rem;
    max-width: var(--container-width);
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }

  .back {
    text-decoration: none;
  }

  .back:hover {
    text-decoration: underline;
  }

  header {
    margin-bottom: 1.5rem;
  }

  h1 {
    margin: 1rem 0 0 0;
  }

  .meta {
    margin: 0;
    color: var(--black);
    font-size: var(--fs-sm);
  }

  article {
    border: 0.3rem solid var(--black);
    border-radius: var(--br-lg);
    background: var(--white);
    overflow: hidden;
  }

  .body {
    padding: 0;
  }

  .body :global(table) {
    max-width: 100%;
  }

  .body :global(img) {
    max-width: 100%;
    height: auto;
  }

  .error {
    padding: 3rem;
    color: #cc0000;
    text-align: center;
  }
</style>
