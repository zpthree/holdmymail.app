<script lang="ts">
  import "$lib/assets/css/main.css";
  import "nprogress/nprogress.css";
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { setAuth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { getPageLoadMs, subscribeToLatency } from "$lib/latency";
  import type NProgressType from "nprogress";

  let { children, data } = $props();
  let latencyMs = $state<number | null>(null);
  let loadMs = $state<number | null>(null);
  let nprogress: typeof NProgressType | null = null;
  let navStartedAt = 0;

  $effect(() => {
    setAuth(data.user, data.token);
  });

  beforeNavigate(() => {
    navStartedAt = performance.now();
    nprogress?.start();
  });

  afterNavigate(() => {
    nprogress?.done();
    if (navStartedAt) {
      loadMs = Math.round(performance.now() - navStartedAt);
      navStartedAt = 0;
    }
  });

  onMount(() => {
    void import("nprogress")
      .then((mod) => {
        nprogress = mod.default;
        nprogress.configure({ showSpinner: false, minimum: 0.16 });
      })
      .catch(() => {});

    const stopLatency = subscribeToLatency((ms) => {
      latencyMs = ms;
    });

    const ms = getPageLoadMs();
    if (ms !== null) loadMs = ms;

    return stopLatency;
  });
</script>

<div class="app-wrapper">
  {@render children()}
</div>

<!-- Portal slot for Modals -->
<div id="modals"></div>

<footer class="status-bar">
  <p class="stats">
    <span title="Round-trip time to the API">
      connection: {latencyMs === null ? "—" : `${latencyMs}ms`}
    </span>
    <span title="Time to load this page">
      load: {loadMs === null ? "—" : `${loadMs}ms`}
    </span>
    <span title="Third-party trackers on this page">trackers: 0</span>
  </p>
  <nav>
    <a href="/privacy">Privacy</a>
    <a href="/terms-and-conditions">Terms</a>
  </nav>
</footer>

<style>
  .app-wrapper {
    display: flex;
    flex-direction: column;
    padding-bottom: 2.25rem;
    min-height: 100vh;
  }

  .status-bar {
    display: flex;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    z-index: 20;
    border-top: 1px solid hsl(from var(--text-color) h s l / 0.12);
    background: var(--bg-color);
    padding: 0.35rem 0.75rem;
    padding-bottom: max(0.35rem, env(safe-area-inset-bottom));
    color: hsl(from var(--text-color) h s l / 0.55);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    margin: 0;
  }

  nav {
    display: flex;
    flex-shrink: 0;
    gap: 0.85rem;
  }

  nav a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :global(#nprogress .bar) {
    background: var(--accent);
    height: 2px;
  }

  :global(#nprogress .peg) {
    box-shadow:
      0 0 10px var(--accent),
      0 0 5px var(--accent);
  }
</style>
