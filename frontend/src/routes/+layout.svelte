<script lang="ts">
  import "$lib/assets/css/main.css";
  import { auth, setAuth } from "$lib/stores/auth";
  import { onNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import { authApi } from "$lib/api.js";

  let { children, data } = $props();

  $effect(() => {
    setAuth(data.user, data.token);
  });
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
</style>
