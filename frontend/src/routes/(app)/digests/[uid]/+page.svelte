<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { preloadData, pushState, goto } from "$app/navigation";
  import { page } from "$app/state";
  import type { Digest } from "$lib/api";
  import SEO from "$lib/components/SEO.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import InboxUID from "../../inbox/[uid]/+page.svelte";

  let {
    data,
  }: {
    data: { digest: Digest | null };
    shallow: boolean;
  } = $props();

  let digest = $derived<Digest | null>(data.digest);
  const uid = $derived(page.params.uid);
  let uid_open = $state(false);

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

  export async function handleDigestLinkClick(e: MouseEvent): Promise<void> {
    const target = e.target as HTMLElement;
    if (target?.tagName !== "A") return;

    const anchor = target as HTMLAnchorElement;
    console.log(anchor.origin, window.location.origin);
    if (anchor.origin !== window.location.origin) {
      e.preventDefault();
      window.open(anchor.href, "_blank");
      return;
    }

    const { href } = anchor;

    // prevent navigation
    e.preventDefault();

    const result = await preloadData(href);
    console.log(result);
    if (result.type === "loaded" && result.status === 200) {
      pushState(href, { selected: result.data });
      uid_open = true;
    } else {
      goto(href);
    }
  }
</script>

<Modal bind:isOpen={uid_open} close={() => history.back()}>
  {#if page.state.selected}
    <!-- pass page data to the +page.svelte component,
		     just like SvelteKit would on navigation -->
    <div class="shallow">
      <InboxUID data={page.state.selected} shallow={true} />
    </div>
  {/if}
</Modal>

<SEO
  path={`/digests/${uid}`}
  data={{
    meta_title: digest?.subject || "Digest",
    meta_description: "View your email digest",
  }}
/>

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

    <article on:click={handleDigestLinkClick}>
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
    padding: 2rem;
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
    color: var(--text-color);
    font-weight: 500;
    font-size: var(--fs-sm);
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
    color: var(--text-color);
    font-size: var(--fs-sm);
  }

  article {
    border: 0.15rem solid var(--text-color);
    border-radius: var(--br-lg);
    background: var(--bg-color-2);
    overflow: hidden;
  }

  .body {
    padding: 0;
  }

  .body :global(table) {
    max-width: 100%;

    :global(a:hover) {
      text-decoration: underline !important;
    }
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

  :global(#modal-children > div) {
    position: relative;
    margin: auto;
    width: 100vw;
    max-width: 48rem;
    height: 100%;
    overflow: auto;
    overscroll-behavior-y: contain;
  }
</style>
