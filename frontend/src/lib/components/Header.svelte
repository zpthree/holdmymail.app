<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$lib/components/Logo.svelte";
  import User from "$lib/components/User.svelte";
  import { auth } from "$lib/stores/auth";
  import { unreadCount } from "$lib/stores/inbox";

  let {
    isMobileMenuOpen = $bindable(false),
    gravatarUrl = null,
  }: {
    isMobileMenuOpen?: boolean;
    gravatarUrl?: string | null;
  } = $props();

  const topLevel = $derived("/" + page.url.pathname.split("/")[1]);
  const fromParam = $derived(page.url.searchParams.get("from"));
  const activeTab = $derived(
    fromParam ? "/" + fromParam.split("/")[1] : topLevel,
  );
  const username = $derived($auth.user?.username ?? "");
</script>

<header>
  <nav>
    <div class="header-left">
      <a id="header-logo" href="/"><Logo /></a>
      <p id="beta">Beta</p>
    </div>
    <ul>
      <li>
        <a href="/digests" class:selected={activeTab === "/digests"}>Digests</a>
      </li>
      <li>
        <a href="/sources" class:selected={activeTab === "/sources"}>Sources</a>
      </li>
      <li>
        <a href="/links" class:selected={activeTab === "/links"}>Links</a>
      </li>
    </ul>
    <div class="header-right">
      <a href="/inbox" class="inbox">
        <span class="hidden-visually">Inbox</span>
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
            d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
          />
        </svg>
        {#if $unreadCount > 0}
          <span class="badge">{$unreadCount > 99 ? "99+" : $unreadCount}</span>
        {/if}
      </a>
      <a class="avatar" href="/user/{username || ''}">
        {#if gravatarUrl}
          <img src={gravatarUrl} alt="{username}'s avatar" />
        {:else}
          <User />
        {/if}
      </a>
      <button
        type="button"
        class="btn btn-black"
        onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
      >
        <span>Menu</span>
      </button>
    </div>
  </nav>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
    backdrop-filter: blur(5px);
    margin: auto 1rem;
    border-radius: 0 0 35px 35px;
    padding-top: 1.5rem;
    max-width: var(--container-width);

    @media screen and (width > 768px) {
      margin: auto;
    }
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 0.15rem solid oklch(from var(--text-color) 0.25 c h);
    border-radius: var(--br-full);
    background-color: var(--bg-color);
    padding-inline: 1.5rem 1rem;
    height: 4rem;

    @media screen and (width > 768px) {
      padding-inline: 2rem;
    }

    > a {
      width: 4rem;
    }
  }

  .header-left {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  #header-logo {
    margin: 0;
    width: auto;

    @media screen and (width > 768px) {
      height: 2rem;
    }

    :global(svg) {
      color: var(--text-color);
    }
  }

  #beta {
    /* position: absolute; */
    /* left: 5.5rem; */
    margin-left: 0.5rem;
    border-radius: var(--br-lg);
    background-color: var(--accent);
    padding: 0.25rem 0.5rem;
    color: var(--white);
    font-weight: 600;
    font-size: 0.65rem;
    text-transform: uppercase;

    @media screen and (width > 768px) {
      /* left: 6rem; */
    }
  }

  .header-right {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .header-right .inbox {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    transition: opacity 200ms;
    margin-right: 0.5rem;
    border-radius: var(--br-full);
    padding: 0.65rem;
    width: 2.5rem;
    height: 2.5rem;

    &:hover {
      background-color: var(--bg-color-2);
    }

    svg {
      color: var(--text-color);
    }
  }

  .badge {
    display: flex;
    position: absolute;
    top: -0.2rem;
    right: -0.3rem;
    justify-content: center;
    align-items: center;
    border-radius: var(--br-full);
    background-color: var(--accent);
    padding: 0 0.3rem;
    min-width: 1.15rem;
    height: 1.15rem;
    pointer-events: none;
    color: var(--white);
    font-weight: 700;
    font-size: 0.6rem;
    line-height: 1;
  }

  .avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 200ms;
    border-radius: var(--br-full);
    background-color: var(--white);
    width: 2.5rem;
    height: 2.5rem;
    overflow: hidden;

    &:hover {
      opacity: 0.8;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    :global(svg) {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--black);
    }
  }

  button {
    @media screen and (width > 768px) {
      display: none;
    }
  }

  nav :global(svg) {
    color: var(--white);
  }

  nav > a:hover :global(svg) {
    opacity: 0.8;
  }

  ul {
    display: none;
    margin: auto;
    padding: 0.2rem;
    width: fit-content;
    max-width: var(--container-width);
    overflow: clip;
    list-style: none;

    @media screen and (width > 768px) {
      display: flex;
      column-gap: 0.75rem;
      justify-content: center;
    }
  }

  ul a {
    display: block;
    transition:
      background-color 150ms,
      color 150ms;
    border-radius: var(--br-full);
    padding: 0.5rem 1rem;
    color: var(--text-color);
    font-weight: bold;
    font-size: var(--fs-base);
    text-align: center;
    text-decoration: none;

    &.selected,
    &:hover {
      background-color: var(--accent);
      color: var(--white);
    }
  }

  .btn {
    padding-inline: 1rem;
  }
</style>
