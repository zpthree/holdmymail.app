<script lang="ts">
  import type { LinkTag, PublicLink } from "$lib/api";

  type ListLink = PublicLink & { hidden?: boolean };

  let {
    links,
    tagHref,
    detailsHref,
    selectMode = false,
    selected = new Set<string>(),
    onToggleSelect,
  }: {
    links: ListLink[];
    tagHref: (tag: LinkTag) => string;
    /** When set, shows a link to the owner-only detail page */
    detailsHref?: (link: ListLink) => string;
    selectMode?: boolean;
    selected?: Set<string>;
    onToggleSelect?: (id: string) => void;
  } = $props();

  type DateGroup = { month: string; day: string; links: ListLink[] };

  let grouped = $derived<DateGroup[]>(groupByDate(links));

  function groupByDate(links: ListLink[]): DateGroup[] {
    const groups = new Map<string, ListLink[]>();

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

{#each grouped as group}
  <section class="date-group">
    <h2 class="date-label">
      <span class="month">{group.month}</span>
      <span class="day">{group.day}</span>
    </h2>
    <ul class="links">
      {#each group.links as link (link._id)}
        <li class="link-item" class:selected={selected.has(link._id)}>
          {#if selectMode}
            <label class="checkbox">
              <input
                type="checkbox"
                checked={selected.has(link._id)}
                onchange={() => onToggleSelect?.(link._id)}
              />
            </label>
          {/if}
          {#if link.ogImage}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="link-thumb"
              tabindex="-1"
            >
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
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="link-title">{link.title || link.ogTitle || link.url}</a
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
              {#if detailsHref}
                <span aria-hidden="true">·</span>
                <a href={detailsHref(link)} class="link-details">Details</a>
              {/if}
              {#if link.hidden}
                <span class="hidden-badge" title="Hidden from your public feed"
                  >Hidden</span
                >
              {/if}
            </span>
            {#if link.ogDescription || link.description}
              <span class="link-desc"
                >{link.ogDescription || link.description}</span
              >
            {/if}
            {#if link.tags.length > 0}
              <div class="tags">
                {#each link.tags as tag (tag._id)}
                  <a href={tagHref(tag)} class="tag">{tag.name}</a>
                {/each}
              </div>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<style>
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
    border-radius: var(--br-lg);
    background: hsl(from var(--accent) h s l / 0.06);
  }

  .date-group {
    margin-bottom: 1.5rem;

    @media screen and (width > 768px) {
      display: flex;
      align-items: flex-start;
      gap: 0 3rem;
    }

    &:not(:last-child) {
      margin-bottom: 3rem;
    }
  }

  .date-label {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem;
    border-radius: var(--br-lg);
    background: var(--text-color);
    letter-spacing: 0.02em;
    text-align: center;

    @media screen and (width > 768px) {
      position: sticky;
      top: 8rem;
      flex-shrink: 0;
      flex-direction: column;
      gap: 0;
      margin-bottom: 0;
      width: 5rem;
      height: 5rem;
    }
  }

  .month {
    color: var(--bg-color-2);
    font-weight: 600;
    text-transform: uppercase;

    @media screen and (width > 768px) {
      font-size: var(--fs-sm);
    }
  }

  .day {
    color: var(--bg-color-2);
    font-weight: 700;
    line-height: 1;

    @media screen and (width > 768px) {
      font-size: var(--fs-lg);
    }
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
    color: inherit;
    text-decoration: none;

    @media screen and (width > 768px) {
      display: flex;
      gap: 1rem;
    }
  }

  .link-item a:not(.tag) {
    color: var(--text-color);
  }

  .link-nothumb,
  .link-thumb {
    display: block;
    flex-shrink: 0;
    width: 100%;
    height: 100%;

    @media screen and (width > 768px) {
      width: 120px;
      height: 80px;
    }
  }

  .link-nothumb {
    border-radius: var(--br-lg);
    background: hsl(from var(--accent) h s l / 0.1);
  }

  .link-thumb:hover img {
    scale: 1.05;
  }

  .link-thumb img {
    transition: scale 200ms ease;
    border-radius: var(--br-lg);
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
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.25rem;
    color: var(--text-color);
    font-size: var(--fs-sm);
  }

  .link-details {
    font-weight: 500;

    &:hover {
      text-decoration: none;
    }
  }

  .hidden-badge {
    border: 1px solid hsl(from var(--text-color) h s l / 0.3);
    border-radius: var(--br-full);
    padding: 0 0.45rem;
    color: var(--gray);
    font-size: var(--fs-xs);
  }

  .favicon {
    border-radius: 2px;
  }

  .link-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--text-color);
    line-height: 1.5;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.15rem;
  }
</style>
