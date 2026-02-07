<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import type { Digest } from "$lib/api";

  let { data } = $props();

  type MonthGroup = { label: string; digests: Digest[] };

  let grouped = $derived<MonthGroup[]>(groupByMonth(data.digests));

  function groupByMonth(digests: Digest[]): MonthGroup[] {
    const groups = new Map<string, Digest[]>();

    for (const digest of digests) {
      const date = new Date(digest.sentAt);
      const key = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(digest);
    }

    return Array.from(groups.entries()).map(([label, digests]) => ({
      label,
      digests,
    }));
  }

  function formatDateTime(ts: number): string {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: $auth.user?.timezone || undefined,
    });
  }
</script>

<div class="digest-list">
  <header>
    <h1 style="font-size: var(--fs-xl)">Digests</h1>
  </header>

  {#if data.digests.length === 0}
    <div class="empty">
      <p>No digests yet</p>
      <p class="hint">
        When your scheduled emails are delivered, a digest will appear here
      </p>
    </div>
  {:else}
    {#each grouped as group}
      <section class="month-group">
        <h2 class="month-label">{group.label}</h2>
        <ul class="digests">
          {#each group.digests as digest}
            <li>
              <a href="/digests/{digest._id}" class="digest-item">
                <span class="subject">{digest.subject}</span>
                <span class="meta">
                  {digest.emailCount} email{digest.emailCount === 1 ? "" : "s"}
                  · {formatDateTime(digest.sentAt)}
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>

<style>
  .digest-list {
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

  .month-group {
    margin-bottom: 2rem;
  }

  .month-label {
    margin: 0 0 0.75rem 0;
    color: var(--accent);
    font-weight: 700;
    font-size: var(--fs-base);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .digests {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    width: 100%;
    list-style: none;
  }

  .digests li {
    transition: border-color 0.15s;
    border: 0.2rem solid transparent;
    border-radius: var(--br-lg);
    background: var(--white);
    overflow: hidden;

    &:hover {
      border-color: var(--accent);
    }
  }

  .digest-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem 1.25rem;
    color: inherit;
    text-decoration: none;
  }

  .subject {
    color: var(--black);
    font-weight: 600;
    font-size: var(--fs-base);
  }

  .meta {
    color: #888;
    font-size: var(--fs-sm);
  }
</style>
