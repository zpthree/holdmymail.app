<script lang="ts">
  import { linkApi, type Link } from "$lib/api";
  import { auth } from "$lib/stores/auth";
  import { liveData } from "$lib/stores/stream";
  import { invalidateAll } from "$app/navigation";
  import { onDestroy } from "svelte";

  let { data } = $props();
  let liveLinks = $state<Link[]>([]);

  const unsub = liveData.links.subscribe((v) => {
    if (v.length > 0) liveLinks = v;
  });

  let links = $derived<Link[]>(liveLinks.length > 0 ? liveLinks : data.links);

  onDestroy(unsub);

  type DateGroup = { month: string; day: string; links: Link[] };

  let grouped = $derived<DateGroup[]>(groupByDate(links));

  let selectMode = $state(false);
  let selected = $state<Set<string>>(new Set());
  let deleting = $state(false);
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

  function groupByDate(links: Link[]): DateGroup[] {
    const groups = new Map<string, Link[]>();

    for (const link of links) {
      const date = new Date(link._creationTime);
      const key = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(link);
    }

    return Array.from(groups.entries()).map(([key, links]) => {
      const date = new Date(links[0]._creationTime);
      const month = date
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
      const day = String(date.getDate());

      return { month, day, links };
    });
  }

  function hostname(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }
</script>

<div class="links-list">
  <header>
    <h1 style="font-size: var(--fs-xl)">Links</h1>
    {#if links.length > 0}
      <div class="bulk-actions">
        {#if selectMode}
          <button class="btn-select" onclick={toggleAll}>
            {selected.size === links.length ? "Deselect All" : "Select All"}
          </button>
          {#if selecting}
            <button class="btn-delete" onclick={bulkDelete} disabled={deleting}>
              {deleting ? "Deleting…" : `Delete (${selected.size})`}
            </button>
          {/if}
          <button class="btn-select" onclick={exitSelectMode}>Cancel</button>
        {:else}
          <button class="btn-select" onclick={enterSelectMode}>Select</button>
        {/if}
      </div>
    {/if}
  </header>

  {#if links.length === 0}
    <div class="empty">
      <p>No saved links yet</p>
      <p class="hint">Use the Chrome extension to save links from any page</p>
    </div>
  {:else}
    {#each grouped as group}
      <section class="date-group">
        <h2 class="date-label">
          <span class="month">{group.month}</span>
          <span class="day">{group.day}</span>
        </h2>
        <ul class="links">
          {#each group.links as link}
            <li class="link-item" class:selected={selected.has(link._id)}>
              {#if selectMode}
                <label class="checkbox">
                  <input
                    type="checkbox"
                    checked={selected.has(link._id)}
                    onchange={() => toggleSelect(link._id)}
                  />
                </label>
              {/if}
              {#if link.ogImage}
                <a href="/links/{link._id}" class="link-thumb">
                  <img
                    src={link.ogImage}
                    alt=""
                    loading="lazy"
                    onerror={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </a>
              {:else}
                <div class="link-nothumb"></div>
              {/if}
              <div class="link-info">
                <a href="/links/{link._id}" class="link-title"
                  >{link.title || link.ogTitle || link.url}</a
                >
                <span class="link-host">
                  {#if link.favicon}
                    <img
                      src={link.favicon}
                      alt=""
                      class="favicon"
                      width="14"
                      height="14"
                      onerror={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  {/if}
                  {link.ogSiteName || hostname(link.url)}
                </span>
                {#if link.ogDescription || link.description}
                  <span class="link-desc"
                    >{link.ogDescription || link.description}</span
                  >
                {/if}
                {#if link.tags.length > 0}
                  <div class="tags">
                    {#each link.tags as tag}
                      <span class="tag">{tag.name}</span>
                    {/each}
                  </div>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>

<style>
  .links-list {
    margin: 0 auto;
    padding: 2rem 1rem;
    max-width: var(--container-width);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .empty .hint {
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-select {
    cursor: pointer;
    border: 1px solid var(--black);
    border-radius: var(--br-lg);
    background: transparent;
    padding: 0.35rem 0.85rem;
    font: inherit;
    font-weight: 600;
    font-size: var(--fs-sm);

    &:hover {
      background: var(--black);
      color: var(--white);
    }
  }

  .btn-delete {
    cursor: pointer;
    border: 1px solid var(--accent);
    border-radius: var(--br-lg);
    background: var(--accent);
    padding: 0.35rem 0.85rem;
    color: var(--white);
    font: inherit;
    font-weight: 600;
    font-size: var(--fs-sm);

    &:hover {
      opacity: 0.85;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .checkbox {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    cursor: pointer;
  }

  .checkbox input {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    accent-color: var(--accent);
  }

  .link-item.selected {
    border-radius: var(--br-md, 0.5rem);
    background: hsl(from var(--accent) h s l / 0.06);
  }

  .date-group {
    display: flex;
    align-items: flex-start;
    gap: 0 3rem;
    margin-bottom: 1.5rem;

    &:not(:last-child) {
      margin-bottom: 3rem;
    }
  }

  .date-label {
    display: flex;
    position: sticky;
    top: 8rem;
    flex-shrink: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0;
    border-radius: var(--br-lg);
    background: var(--black);
    width: 5rem;
    height: 5rem;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .month {
    color: var(--white);
    font-weight: 600;
    font-size: var(--fs-sm);
    text-transform: uppercase;
  }

  .day {
    color: var(--white);
    font-weight: 700;
    font-size: var(--fs-lg);
    line-height: 1;
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .link-item {
    display: flex;
    gap: 1rem;
    color: inherit;
    text-decoration: none;
  }

  .link-item a {
    color: var(--black);
  }

  .link-nothumb,
  .link-thumb {
    flex-shrink: 0;
    border-radius: var(--br-md, 0.5rem);
    width: 120px;
    height: 80px;
    overflow: hidden;
  }

  .link-nothumb {
    background: hsl(from var(--accent) h s l / 0.1);
  }

  .link-thumb:hover img {
    scale: 1.05;
  }

  .link-thumb img {
    transition: scale 200ms ease;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .link-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  .link-title {
    overflow: hidden;
    font-weight: 600;
    font-size: var(--fs-md);
    text-decoration: none;
    text-overflow: ellipsis;
  }

  .link-title:hover {
    text-decoration: underline;
  }

  .link-host {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.25rem;
    color: var(--black);
    font-size: var(--fs-sm);
  }

  .favicon {
    border-radius: 2px;
  }

  .link-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--black);
    line-height: 1.5;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.15rem;
  }

  .tag {
    border-radius: var(--br-full);
    background: var(--black);
    padding: 0.15rem 0.55rem;
    color: var(--white);
    font-weight: 500;
    font-size: var(--fs-xs);
  }
</style>
