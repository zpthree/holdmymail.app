<script lang="ts">
  import type { Sender, Tag } from "$lib/api";
  import { auth } from "$lib/stores/auth";
  import { liveQuery, api } from "$lib/convex";
  import { onDestroy } from "svelte";

  let { data } = $props();

  const userId = $auth.user?.id;

  const liveSendersRaw = userId
    ? liveQuery(api.senders.listByUser, { userId: userId as any }, [])
    : null;
  const liveTagsRaw = userId
    ? liveQuery(api.tags.listByUser, { userId: userId as any }, [])
    : null;

  let rawSenders = $state<any[]>([]);
  let rawTags = $state<any[]>([]);

  const unsubSenders = liveSendersRaw?.subscribe((v: any[]) => {
    rawSenders = v;
  });
  const unsubTags = liveTagsRaw?.subscribe((v: any[]) => {
    rawTags = v;
  });

  function hydrateSenders(senders: any[], tags: any[]): Sender[] {
    const tagMap = new Map(tags.map((t: any) => [t._id, t]));
    return senders.map((s: any) => ({
      ...s,
      tags: (s.tagIds ?? [])
        .map((id: string) => tagMap.get(id))
        .filter(Boolean),
    }));
  }

  let senders = $derived<Sender[]>(
    rawSenders.length > 0 ? hydrateSenders(rawSenders, rawTags) : data.senders,
  );

  onDestroy(() => {
    unsubSenders?.();
    unsubTags?.();
    liveSendersRaw?.destroy();
    liveTagsRaw?.destroy();
  });
</script>

<div class="sources">
  <header>
    <h1 style="font-size: var(--fs-xl)">Sources</h1>
  </header>

  {#if senders.length === 0}
    <div class="empty">
      <p>No sources yet</p>
      <p class="hint">Add senders to manage when their emails get delivered</p>
    </div>
  {:else}
    <ul class="sender-list">
      {#each senders as sender}
        <li class="sender-item">
          <a href="/sources/{sender._id}">
            <div class="sender-avatar" style="background: {sender.color}">
              {sender.name.charAt(0).toUpperCase()}
            </div>
            <div class="sender-info">
              <span class="sender-name">{sender.name}</span>
              <span class="sender-email">{sender.email}</span>
            </div>
            {#if sender.tags.length > 0}
              <div class="sender-tags">
                {#each sender.tags as tag}
                  <span class="tag">{tag.name}</span>
                {/each}
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .sources {
    margin: 0 auto;
    padding: 2rem;
    max-width: 800px;
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

  .sender-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sender-item {
    transition: border-color 0.15s;
    border: 0.2rem solid transparent;
    border-radius: var(--br-lg);
    background: var(--white);
    overflow: hidden;

    &:hover {
      border-color: var(--accent);
    }
  }

  .sender-item > a {
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: background 0.15s;
    background-color: var(--white);
    padding: 1rem;
    color: inherit;
    text-decoration: none;
  }

  .sender-item > a:hover {
    background: #f9f9f9;
  }

  .sender-avatar {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .sender-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .sender-name {
    font-weight: 600;
  }

  .sender-email {
    overflow: hidden;
    color: #666;
    font-size: 0.85rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sender-tags {
    display: flex;
    flex-shrink: 0;
    gap: 0.375rem;
  }

  .tag {
    border-radius: 4px;
    background: hsl(from var(--accent) h s l / 0.15);
    padding: 0.2rem 0.5rem;
    color: var(--black);
    font-size: 0.75rem;
  }
</style>
