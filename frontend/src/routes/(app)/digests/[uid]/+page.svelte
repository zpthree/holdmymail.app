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
  {#if digest}
    <article>
      <div class="body">
        <iframe
          srcdoc={digest.htmlBody}
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts"
          title="Digest content"
          onload={(e) => {
            const iframe = /** @type {HTMLIFrameElement} */ (e.currentTarget);
            const doc = iframe.contentDocument;
            if (doc) {
              // reset default margins & prevent inner scrollbar
              doc.body.style.margin = "0";
              doc.body.style.fontFamily = "Rubik, sans-serif";
              doc.documentElement.style.overflow = "hidden";
              iframe.style.height = doc.documentElement.scrollHeight + 1 + "px";
            }

            // Add click handler to iframe content
            doc.addEventListener("click", async (clickEvent) => {
              const target = clickEvent.target as HTMLElement;
              if (target?.tagName !== "A") return;

              const anchor = target as HTMLAnchorElement;

              if (anchor.origin !== window.location.origin) {
                clickEvent.preventDefault();
                window.open(anchor.href, "_blank");
                return;
              }

              const { href } = anchor;

              // prevent navigation
              clickEvent.preventDefault();

              const result = await preloadData(href);
              if (result.type === "loaded" && result.status === 200) {
                pushState(href, { selected: result.data });
                uid_open = true;
              } else {
                goto(href);
              }
            });

            // Bubble Escape key from iframe to close modal
            doc.addEventListener("keydown", (keyEvent) => {
              if (keyEvent.key === "Escape") {
                window.dispatchEvent(
                  new KeyboardEvent("keyup", {
                    key: "Escape",
                    code: "Escape",
                    bubbles: true,
                  }),
                );
              }
            });
          }}
        ></iframe>
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

  article {
    /* border: 0.15rem solid oklch(from var(--text-color) 0.25 c h); */
    border-radius: var(--br-lg);
    background: var(--bg-color-2);
    overflow: hidden;
  }

  .body {
    padding: 0;

    iframe {
      display: block;
      border: none;
      width: 100%;
      overflow: hidden;
    }
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
