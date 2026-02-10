<script lang="ts">
  import { page, navigating } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";

  let { isMobileMenuOpen = $bindable(false) } = $props();

  $effect(() => {
    if ($navigating) isMobileMenuOpen = false;
  });
</script>

<Modal bind:isOpen={isMobileMenuOpen} transition={{ y: 50, duration: 120 }}>
  <div
    id="mobile-nav-wrapper"
    class:homepage-mobile-nav={$page.url.pathname === "/"}
  >
    <nav aria-label="Mobile navigation">
      <ul>
        <!-- <li class="mb-6">
          <a
            class:border-primary={$page.url.pathname === "/inbox"}
            href="/inbox">Inbox</a
          >
        </li> -->
        <li class="mb-6">
          <a
            class:border-primary={$page.url.pathname === "/digests"}
            href="/digests">Digests</a
          >
        </li>
        <li class="mb-6">
          <a
            class:border-primary={$page.url.pathname === "/sources"}
            href="/sources">Sources</a
          >
        </li>
        <li class="mb-6">
          <a
            class:border-primary={$page.url.pathname === "/links"}
            href="/links">Links</a
          >
        </li>
      </ul>
    </nav>
    <button onclick={() => (isMobileMenuOpen = false)}>
      <span class="hidden-visually">Mobile Menu</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</Modal>

<style>
  #mobile-nav-wrapper {
    position: relative;
    z-index: 10;
    background-color: var(--offwhite);
    padding-top: 2.5rem;
    width: 100vw;
    height: 100dvh;
  }

  nav {
    border-radius: 0.375rem;
  }

  ul {
    margin-top: 0;
    padding: 1.5rem 1rem;
    width: 100%;
    list-style: none;
  }

  li {
    margin-bottom: 1rem;
  }

  a {
    display: block;
    color: var(--black);
    font-weight: 600;
    font-size: var(--fs-xl);
    text-align: center;
    text-decoration: none;
  }

  button {
    display: flex;
    position: fixed;
    top: 1rem;
    right: 1rem;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s;
    cursor: pointer;
    border: none;
    border-radius: var(--br-circle);
    background-color: var(--accent);
    padding: 0.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--white);
  }
</style>
