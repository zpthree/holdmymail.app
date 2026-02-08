<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { trapFocus } from "$lib/trapFocus";
  import { portal } from "$lib/actions.js";

  function initTrapFocus(e: KeyboardEvent): void {
    trapFocus(e, "modal");
  }

  function closeWithEscape(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      isOpen = false;
    }
  }

  let {
    isOpen = $bindable(false),
    transition = { y: -20, duration: 15 },
    classes = "",
    children,
  }: {
    isOpen?: boolean;
    transition?: { y?: number; x?: number; duration?: number };
    classes?: string;
    children?: import("svelte").Snippet;
  } = $props();

  console.log({ isOpen });
</script>

<svelte:window onkeydown={initTrapFocus} onkeyup={closeWithEscape} />

{#if isOpen}
  <div
    role="dialog"
    id="modal"
    class:window-noscroll={isOpen}
    use:portal={"modals"}
  >
    <div
      id="modal-overlay"
      aria-hidden="true"
      onclick={() => (isOpen = false)}
    ></div>

    <div id="modal-children" transition:fly={transition}>
      {#if children}
        {@render children()}
      {/if}
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
  }

  :global(html:has(.window-noscroll), html:has(.window-noscroll) body) {
    overflow: hidden;
  }
</style>
