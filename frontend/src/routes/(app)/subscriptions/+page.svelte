<script lang="ts">
  import type { Sender } from "$lib/api";
  import { liveData } from "$lib/stores/stream";
  import { onDestroy } from "svelte";

  let { data } = $props();
  let liveSenders = $state<Sender[]>([]);

  const unsub = liveData.senders.subscribe((v) => {
    if (v.length > 0) liveSenders = v;
  });

  let senders = $derived<Sender[]>(
    liveSenders.length > 0 ? liveSenders : data.senders,
  );

  onDestroy(unsub);
</script>

<div class="subscriptions">
  <header>
    <h1 style="font-size: var(--fs-xl)">Subscriptions</h1>
  </header>

  {#if senders.length === 0}
    <div class="empty">
      <p>No subscriptions yet</p>
      <p class="hint">Add senders to manage when their emails get delivered</p>
    </div>
  {:else}
    <ul class="sender-list">
      {#each senders as sender}
        <li>
          <a href="/subscriptions/{sender._id}" class="sender-item">
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
  .subscriptions {
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
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sender-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: background 0.15s;
    border-bottom: 1px solid #eee;
    padding: 1rem;
    color: inherit;
    text-decoration: none;
  }

  .sender-item:hover {
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
    background: #eef;
    padding: 0.2rem 0.5rem;
    color: #336;
    font-size: 0.75rem;
  }
</style>
