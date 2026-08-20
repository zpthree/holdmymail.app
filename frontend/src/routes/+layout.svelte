<script lang="ts">
  import "$lib/assets/css/main.css";
  import { setAuth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { subscribeToLatency } from "$lib/latency";

  let { children, data } = $props();
  let latencyMs = $state<number | null>(null);

  $effect(() => {
    setAuth(data.user, data.token);
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

<footer>
  <ul>
    <li>
      <a href="/privacy">Privacy Policy</a>
    </li>
    <li>
      <a href="/terms-and-conditions">Terms and Conditions</a>
    </li>
    {#if latencyMs !== null}
      <li class="latency" title="Round-trip time to the API">{latencyMs}ms</li>
    {/if}
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

    .latency {
      color: hsl(from var(--text-color) h s l / 0.55);
    }
  }
</style>
