<script lang="ts">
  import { linkApi, type Link } from "$lib/api";
  import { auth } from "$lib/stores/auth";
  import { invalidateAll } from "$app/navigation";
  import { PAGE_SIZE } from "$lib/constants";
  import SEO from "$lib/components/SEO.svelte";
  import LinkList from "$lib/components/LinkList.svelte";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import { applyTagFilter, tagFilterHref } from "$lib/tagFilter";

  let { data } = $props();

  // Paginated state (reset from each load, then mutated by loadMore)
  let extraLinks = $state<Link[]>([]);
  let cursor = $state<string | null>(null);
  let hasMore = $state(false);
  let loadingMore = $state(false);

  $effect(() => {
    cursor = data.cursor;
    hasMore = data.hasMore;
    extraLinks = [];
  });

  let links = $derived.by<Link[]>(() => {
    if (extraLinks.length === 0) return data.links;
    const seen = new Set(data.links.map((l) => l._id));
    const unique = extraLinks.filter((l) => !seen.has(l._id));
    return [...data.links, ...unique];
  });

  let filtering = $derived(data.selectedTags.length > 0);
  let feedUrl = $derived(
    data.user?.linksPublic ? `/feed/${data.user.username}` : null,
  );

  async function loadMore() {
    if (!$auth.token || !cursor || loadingMore) return;
    loadingMore = true;
    try {
      const result = await linkApi.listPaginated(
        $auth.token,
        PAGE_SIZE,
        cursor,
        data.selectedTags,
      );
      extraLinks = [...extraLinks, ...result.items];
      cursor = result.hasMore ? result.cursor : null;
      hasMore = result.hasMore;
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      loadingMore = false;
    }
  }

  let selectMode = $state(false);
  let selected = $state<Set<string>>(new Set());
  let deleting = $state(false);
  let updatingVisibility = $state(false);
  let selecting = $derived(selected.size > 0);

  function enterSelectMode() {
    selectMode = true;
  }

  function exitSelectMode() {
    selectMode = false;
    selected = new Set();
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  }

  function toggleAll() {
    if (selected.size === links.length) {
      selected = new Set();
    } else {
      selected = new Set(links.map((l) => l._id));
    }
  }

  async function bulkDelete() {
    if (!$auth.token || selected.size === 0) return;
    if (
      !confirm(`Delete ${selected.size} link${selected.size > 1 ? "s" : ""}?`)
    )
      return;

    deleting = true;
    try {
      await linkApi.bulkDelete([...selected], $auth.token);
      selected = new Set();
      await invalidateAll();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      deleting = false;
    }
  }

  async function bulkSetHidden(hidden: boolean) {
    if (!$auth.token || selected.size === 0) return;

    updatingVisibility = true;
    try {
      await linkApi.bulkSetHidden([...selected], hidden, $auth.token);
      selected = new Set();
      await invalidateAll();
    } catch (err) {
      console.error("Bulk visibility update failed:", err);
    } finally {
      updatingVisibility = false;
    }
  }
</script>

<SEO
  path="/links"
  data={{
    meta_title: "Links",
    meta_description: "View your saved links",
  }}
/>

<div class="links-list">
  <header>
    <h1 style="font-size: var(--fs-xl)">Links</h1>
    {#if links.length > 0}
      <div class="bulk-actions">
        {#if selectMode}
          <button class="btn btn-white" onclick={toggleAll}>
            {selected.size === links.length ? "Deselect All" : "Select All"}
          </button>
          {#if selecting}
            <button
              class="btn btn-white"
              onclick={() => bulkSetHidden(true)}
              disabled={updatingVisibility}
              title="Hide from your public feed">Hide</button
            >
            <button
              class="btn btn-white"
              onclick={() => bulkSetHidden(false)}
              disabled={updatingVisibility}
              title="Show on your public feed">Unhide</button
            >
            <button
              class="btn btn-accent"
              onclick={bulkDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : `Delete (${selected.size})`}
            </button>
          {/if}
          <button class="btn btn-white" onclick={exitSelectMode}>Cancel</button>
        {:else}
          <button class="btn btn-white" onclick={enterSelectMode}>Select</button
          >
        {/if}
      </div>
    {/if}
  </header>

  {#if data.tags.length > 0 || filtering || feedUrl}
    <div class="toolbar">
      {#if data.tags.length > 0 || filtering}
        <TagFilter
          tags={data.tags}
          selected={data.selectedTags}
          onchange={(names) => applyTagFilter("/links", names)}
        />
      {/if}
      {#if feedUrl}
        <a href={feedUrl} class="feed-link">Public feed ↗</a>
      {/if}
    </div>
  {/if}

  {#if links.length === 0}
    <div class="empty">
      {#if filtering}
        <p>No links with {data.selectedTags.length > 1 ? "these tags" : "this tag"}</p>
        <p class="hint"><a href="/links">Show all links</a></p>
      {:else}
        <p>No saved links yet</p>
        <p class="hint">Use the Chrome extension to save links from any page</p>
      {/if}
    </div>
  {:else}
    <LinkList
      {links}
      tagHref={(tag) => tagFilterHref("/links", [tag.name])}
      detailsHref={(link) => `/links/${link._id}`}
      {selectMode}
      {selected}
      onToggleSelect={toggleSelect}
    />

    {#if hasMore}
      <div class="load-more">
        <button class="btn btn-black" onclick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading…" : "Load More"}
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .links-list {
    margin: 0 auto;
    padding: 2rem;
    max-width: var(--container-width);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .feed-link {
    margin-left: auto;
    color: var(--text-color);
    font-weight: 500;
    font-size: var(--fs-sm);
  }

  .empty .hint {
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .empty .hint a {
    color: var(--text-color);
  }

  .bulk-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .btn {
    padding-block: 0.35rem;
  }

  .load-more {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  .btn.btn-black {
    padding-block: 0.35rem;
  }
</style>
