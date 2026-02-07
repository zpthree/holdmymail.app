<script>
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import Logo from "$lib/components/Logo.svelte";
  import User from "$lib/components/User.svelte";

  const topLevel = $derived("/" + page.url.pathname.split("/")[1]);
  const fromParam = $derived(page.url.searchParams.get("from"));
  const activeTab = $derived(
    fromParam ? "/" + fromParam.split("/")[1] : topLevel,
  );
  const username = $derived(browser ? localStorage.getItem("username") : null);
</script>

<header>
  <nav>
    <p id="beta">Alpha</p>
    <a style="height: 2rem; width: auto;" href="/"><Logo /></a>
    <ul>
      <li>
        <a href="/inbox" class:selected={activeTab === "/inbox"}>Inbox</a>
      </li>
      <li>
        <a href="/digests" class:selected={activeTab === "/digests"}>Digests</a>
      </li>
      <li>
        <a href="/subscriptions" class:selected={activeTab === "/subscriptions"}
          >Subscriptions</a
        >
      </li>
      <li>
        <a href="/links" class:selected={activeTab === "/links"}>Links</a>
      </li>
    </ul>
    <a class="avatar" href="/user/{username || ''}">
      <User />
    </a>
  </nav>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
    margin: auto;
    border-radius: 0 0 35px 35px;
    background-color: var(--offwhite);
    padding-top: 1.5rem;
    width: calc(var(--container-width) + 4rem);
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: var(--br-full);
    border-block: 0.1rem solid var(--black);
    background-color: var(--black);
    padding: 0 2rem;
    height: 4rem;

    > a {
      width: 4rem;
    }
  }

  #beta {
    position: absolute;
    top: 0.5rem;
    left: -0.5rem;
    rotate: -20deg;
    margin-left: 0.5rem;
    border-radius: var(--br-lg);
    background-color: var(--accent);
    padding: 0.25rem 0.5rem;
    color: var(--white);
    font-weight: 600;
    font-size: 0.65rem;
  }

  .avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--br-full);
    background-color: var(--white);
    width: 2.5rem;
    height: 2.5rem;

    :global(svg) {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--black);
    }
  }

  nav :global(svg) {
    color: var(--white);
  }

  nav > a:hover :global(svg) {
    opacity: 0.8;
  }

  ul {
    display: flex;
    column-gap: 0.75rem;
    justify-content: center;
    margin: auto;
    padding: 0;
    width: fit-content;
    max-width: var(--container-width);
    overflow: clip;
    list-style: none;
  }

  ul a {
    display: block;
    border-radius: var(--br-full);
    padding: 0.5rem 2rem;
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
