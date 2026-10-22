<script lang="ts">
  import type { LinkTag } from "$lib/api";

  let {
    tags,
    selected,
    onchange,
  }: {
    tags: LinkTag[];
    /** Selected tag names */
    selected: string[];
    onchange: (names: string[]) => void;
  } = $props();

  let details = $state<HTMLDetailsElement>();

  // Keep selected tags visible even if they no longer appear on any link
  let options = $derived.by<string[]>(() => {
    const names = tags.map((t) => t.name);
    const missing = selected.filter((name) => !names.includes(name));
    return [...names, ...missing];
  });

  function toggle(name: string) {
    onchange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name],
    );
  }

  function handleWindowClick(e: MouseEvent) {
    if (details?.open && !details.contains(e.target as Node)) {
      details.open = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && details?.open) {
      details.open = false;
      details.querySelector("summary")?.focus();
    }
  }
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<div class="tag-filter">
  <details bind:this={details}>
    <summary class="btn btn-white">
      Tags{selected.length > 0 ? ` (${selected.length})` : ""}
    </summary>
    <div class="menu" role="group" aria-label="Filter by tags">
      {#if options.length === 0}
        <p class="empty">No tags yet</p>
      {:else}
        {#each options as name (name)}
          <label>
            <input
              type="checkbox"
              checked={selected.includes(name)}
              onchange={() => toggle(name)}
            />
            <span>{name}</span>
          </label>
        {/each}
      {/if}
    </div>
  </details>

  {#if selected.length > 0}
    <ul class="chips" aria-label="Active tag filters">
      {#each selected as name (name)}
        <li>
          <button
            type="button"
            class="tag"
            onclick={() => toggle(name)}
            aria-label="Remove {name} filter"
          >
            {name} <span aria-hidden="true">×</span>
          </button>
        </li>
      {/each}
      <li>
        <button type="button" class="clear" onclick={() => onchange([])}
          >Clear</button
        >
      </li>
    </ul>
  {/if}
</div>

<style>
  .tag-filter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  details {
    position: relative;
  }

  summary {
    padding-block: 0.35rem;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      margin-left: 0.35rem;
      content: "▾";
      font-size: 0.75em;
    }
  }

  .menu {
    display: flex;
    position: absolute;
    top: calc(100% + 0.35rem);
    left: 0;
    flex-direction: column;
    z-index: 5;
    box-shadow: 0 8px 24px hsl(0 0% 0% / 0.12);
    border: 1px solid hsl(from var(--text-color) h s l / 0.15);
    border-radius: var(--br-lg);
    background: var(--bg-color-2);
    padding: 0.4rem;
    width: max-content;
    min-width: 12rem;
    max-width: min(20rem, calc(100vw - 2rem));
    max-height: 18rem;
    overflow-y: auto;
  }

  .menu label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border-radius: var(--br-md, 0.5rem);
    padding: 0.4rem 0.5rem;
    font-size: var(--fs-sm);

    &:hover {
      background: hsl(from var(--text-color) h s l / 0.06);
    }
  }

  .menu input {
    accent-color: var(--accent);
  }

  .empty {
    margin: 0;
    padding: 0.4rem 0.5rem;
    color: var(--gray);
    font-size: var(--fs-sm);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .chips .tag {
    cursor: pointer;
    border: 0;
    font-family: inherit;

    &:hover {
      background: var(--accent);
      color: var(--white);
    }
  }

  .clear {
    cursor: pointer;
    border: 0;
    background: none;
    padding: 0.2rem 0.35rem;
    color: var(--text-color);
    font-size: var(--fs-xs);
    font-family: inherit;
    text-decoration: underline;
  }
</style>
