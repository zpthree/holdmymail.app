<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$lib/components/Logo.svelte";
  import User from "$lib/components/User.svelte";
  import { auth } from "$lib/stores/auth";

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
    <p id="beta">Beta</p>
    <a id="header-logo" href="/"><Logo /></a>
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
      <a class="avatar" href="/user/{username || ''}">
        {#if gravatarUrl}
          <img src={gravatarUrl} alt="{username}'s avatar" />
        {:else}
          <User />
        {/if}
      </a>
      <button
        type="button"
        class="btn btn-white"
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
    margin: auto 1rem;
    border-radius: 0 0 35px 35px;
    background-color: var(--bg-color);
    padding-top: 1.5rem;
    max-width: calc(var(--container-width) + 4rem);

    @media screen and (width > 768px) {
      margin: auto;
    }
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: var(--br-full);
    border-block: 0.1rem solid var(--black);
    background-color: var(--black);
    padding-inline: 1.5rem 1rem;
    height: 4rem;

    @media screen and (width > 768px) {
      padding-inline: 2rem;
    }

    > a {
      width: 4rem;
    }
  }

  #header-logo {
    margin: 0;
    width: auto;

    @media screen and (width > 768px) {
      height: 2rem;
    }
  }

  #beta {
    position: absolute;
    left: 5.5rem;
    margin-left: 0.5rem;
    border-radius: var(--br-lg);
    background-color: var(--accent);
    padding: 0.25rem 0.5rem;
    color: var(--white);
    font-weight: 600;
    font-size: 0.65rem;
    text-transform: uppercase;

    @media screen and (width > 768px) {
      left: 6rem;
    }
  }

  .header-right {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
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
    padding: 0;
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
    border-radius: var(--br-full);
    padding: 0.5rem 1rem;
    color: var(--white);
    font-weight: bold;
    font-size: var(--fs-base);
    text-align: center;
    text-decoration: none;

    &.selected,
    &:hover {
      background-color: var(--white);
      color: var(--black);
    }
  }
</style>
