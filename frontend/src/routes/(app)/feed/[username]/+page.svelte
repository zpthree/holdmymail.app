<script lang="ts">
  import { publicApi, type PublicLink } from "$lib/api";
  import { PAGE_SIZE } from "$lib/constants";
  import SEO from "$lib/components/SEO.svelte";
  import LinkList from "$lib/components/LinkList.svelte";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import { applyTagFilter, tagFilterHref } from "$lib/tagFilter";

  let { data } = $props();

  // Paginated state (reset from each load, then mutated by loadMore)
  let extraLinks = $state<PublicLink[]>([]);
  let cursor = $state<string | null>(null);
  let hasMore = $state(false);
  let loadingMore = $state(false);

  $effect(() => {
    cursor = data.cursor;
    hasMore = data.hasMore;
    extraLinks = [];
  });

  let links = $derived.by<PublicLink[]>(() => {
    if (extraLinks.length === 0) return data.links;
    const seen = new Set(data.links.map((l) => l._id));
    const unique = extraLinks.filter((l) => !seen.has(l._id));
    return [...data.links, ...unique];
  });

  let feedPath = $derived(`/feed/${data.username}`);
  let filtering = $derived(data.selectedTags.length > 0);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    loadingMore = true;
    try {
      const result = await publicApi.listLinks(
        data.username,
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
</script>

<SEO
  path={feedPath}
  data={{
    meta_title: `${data.username}'s links`,
    meta_description: `Links saved and shared by ${data.username}`,
  }}
/>

<div class="feed">
  <header>
    <h1>{data.username}'s links</h1>
  </header>

  {#if data.tags.length > 0 || filtering}
    <div class="toolbar">
      <TagFilter
        tags={data.tags}
        selected={data.selectedTags}
        onchange={(names) => applyTagFilter(feedPath, names)}
      />
    </div>
  {/if}

  {#if links.length === 0}
    <div class="empty">
      {#if filtering}
        <p>No links with {data.selectedTags.length > 1 ? "these tags" : "this tag"}</p>
        <p class="hint"><a href={feedPath}>Show all links</a></p>
      {:else}
        <p>No links shared yet</p>
      {/if}
    </div>
  {:else}
    <LinkList {links} tagHref={(tag) => tagFilterHref(feedPath, [tag.name])} />

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
  .feed {
    margin: 0 auto;
    padding: 2rem;
    max-width: var(--container-width);
  }

  header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  h1 {
    margin: 0;
    font-size: var(--fs-xl);
    overflow-wrap: anywhere;
  }

  .toolbar {
    margin-bottom: 2rem;
  }

  .empty .hint {
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .empty .hint a {
    color: var(--text-color);
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
