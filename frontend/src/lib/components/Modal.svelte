<script lang="ts">
  import { fly } from "svelte/transition";
  import { trapFocus } from "$lib/trapFocus";
  import { portal } from "$lib/actions.js";

  function initTrapFocus(e: KeyboardEvent): void {
    trapFocus(e, "modal");
  }

  function closeWithEscape(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      closeModal();
    }
  }

  /* close modal */
  function closeModal() {
    isOpen = false;

    if (close) {
      close();
    }
  }

  let {
    isOpen = $bindable(false),
    transition = { x: 200, duration: 150 },
    classes = "",
    children,
    close,
  }: {
    isOpen?: boolean;
    transition?: { y?: number; x?: number; duration?: number };
    classes?: string;
    children?: import("svelte").Snippet;
    close?: () => void;
  } = $props();
</script>

<svelte:window onkeydown={initTrapFocus} onkeyup={closeWithEscape} />

{#if isOpen}
  <div
    role="dialog"
    id="modal"
    class:window-noscroll={isOpen}
    use:portal={"modals"}
  >
    <div id="modal-overlay" aria-hidden="true" onclick={closeModal}></div>

    <div id="modal-children" transition:fly={transition}>
      <div>
        <button type="button" class="btn btn-accent" onclick={closeModal}
          >Close</button
        >

        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  #modal {
    display: flex;
    position: fixed;
    justify-content: center;
    align-items: start;
    z-index: 50;
    inset: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }

  #modal-overlay {
    position: fixed;
    z-index: 20;
    inset: 0;
    background-color: hsla(from var(--black) h s l / 0.5);
  }

  #modal-children {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    background: var(--bg-color);
  }

  :global(html:has(.window-noscroll), html:has(.window-noscroll) body) {
    overflow: hidden;
  }

  #modal button {
    position: absolute;
    top: 2rem;
    left: 2rem;
    padding-block: 0.35rem;
  }
</style>
