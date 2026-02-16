<script lang="ts">
  import { PUBLIC_FATHOM_ID } from "$env/static/public";
  import * as Fathom from "fathom-client";
  import "$lib/assets/css/main.css";
  import { setAuth } from "$lib/stores/auth";
  import { authApi } from "$lib/api";
  import { browser } from "$app/environment";
  import { onNavigate } from "$app/navigation";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(async () => {
    const token = browser ? localStorage.getItem("token") : null;
    const userId = browser ? localStorage.getItem("userId") : null;

    if (token && userId) {
      try {
        const user = await authApi.getUser(userId, token);
        setAuth(
          {
            id: user.id,
            email: user.email,
            username: user.username,
            timezone:
              user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          token,
        );
      } catch {
        setAuth(null, null);
      }
    } else {
      setAuth(null, null);
    }

    Fathom.load(PUBLIC_FATHOM_ID, {
      includedDomains: ["holdmymail.app"],
    });
  });

  onNavigate(() => {
    Fathom.trackPageview();
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
