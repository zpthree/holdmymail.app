<script lang="ts">
  import "$lib/assets/css/main.css";
  import "nprogress/nprogress.css";
  import NProgress from "nprogress";
  import { browser } from "$app/environment";
  import { navigating } from "$app/state";
  import { setAuth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { subscribeToLatency } from "$lib/latency";

  let { children, data } = $props();
  let latencyMs = $state<number | null>(null);

  NProgress.configure({ showSpinner: false, minimum: 0.16 });

  $effect(() => {
    setAuth(data.user, data.token);
  });

  $effect(() => {
    if (!browser) return;
    if (navigating.to) NProgress.start();
    else NProgress.done();
  });

  onMount(() => subscribeToLatency((ms) => {
    latencyMs = ms;
  }));
</script>

<div class="app-wrapper">
  {@render children()}
</div>

<!-- Portal slot for Modals -->
<div id="modals"></div>

{#if latencyMs !== null}
  <p class="ping" title="Round-trip time to the API">ping: {latencyMs}ms</p>
{/if}

<footer>
  <ul>
    <li>
      <a href="/privacy">Privacy Policy</a>
    </li>
    <li>
      <a href="/terms-and-conditions">Terms and Conditions</a>
    </li>
  </ul>
</footer>

<style>
  .app-wrapper {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 4rem);
  }

  footer {
    padding: 0 0 1rem;
    font-size: var(--fs-xs);

    ul {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      color: var(--text-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .ping {
    position: fixed;
    top: 0.5rem;
    right: 0.75rem;
    z-index: 20;
    margin: 0;
    pointer-events: none;
    color: hsl(from var(--text-color) h s l / 0.55);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
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
