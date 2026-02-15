<script lang="ts" module>
  import { preloadData, pushState, goto } from "$app/navigation";

  export async function handleDigestLinkClick(e: MouseEvent): Promise<void> {
    const target = e.target as HTMLElement;
    if (target?.tagName !== "A") return;

    const anchor = target as HTMLAnchorElement;
    if (anchor.origin !== window.location.origin) return;

    const { href } = anchor;

    // prevent navigation
    e.preventDefault();

    const result = await preloadData(href);

    if (result.type === "loaded" && result.status === 200) {
      pushState(href, { selected: result.data });
    } else {
      goto(href);
    }
  }
</script>

<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import InboxUID from "../../routes/(app)/inbox/[uid]/+page.svelte";
  import { page } from "$app/state";

  let { children } = $props();
  let uid_open = $state(false);
</script>

<Modal bind:isOpen={uid_open} close={() => history.back()}>
  {#if page.state.selected}
    <!-- pass page data to the +page.svelte component,
		     just like SvelteKit would on navigation -->
    <div class="shallow">
      <InboxUID data={page.state.selected} shallow={true} />
    </div>
  {/if}
</Modal>

<div>
  {@render children()}
</div>
