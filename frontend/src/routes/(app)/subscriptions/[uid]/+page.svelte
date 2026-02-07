<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { senderApi, type Sender, type Email } from "$lib/api";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let sender = $state<Sender | null>(data.sender);
  let emails = $state<Email[]>(data.emails);
  let error = $state("");
  let deleting = $state(false);

  const uid = $derived($page.params.uid);

  async function handleDelete() {
    if (!$auth.token || !uid || !confirm("Remove this subscription?")) return;

    deleting = true;
    try {
      await senderApi.delete(uid, $auth.token);
      goto("/subscriptions");
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to delete subscription";
      deleting = false;
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
</script>

<div class="subscription-detail">
  <nav>
    <a href="/subscriptions" class="back">← Subscriptions</a>
    {#if sender}
      <div class="actions">
        <a href="/subscriptions/{uid}/edit" class="edit-btn">Edit</a>
        <button onclick={handleDelete} disabled={deleting} class="delete-btn">
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    {/if}
  </nav>

  {#if error}
    <div class="error">{error}</div>
  {:else if sender}
    <header>
      <div class="sender-avatar" style="background: {sender.color};">
        {sender.name.charAt(0).toUpperCase()}
      </div>
      <div class="sender-header-info">
        <h1 style="font-size: var(--fs-xl)">{sender.name}</h1>
        <span class="sender-email">{sender.email}</span>
        {#if sender.tags.length > 0}
          <div class="sender-tags">
            {#each sender.tags as tag}
              <span class="tag">{tag.name}</span>
            {/each}
          </div>
        {/if}
      </div>
    </header>

    <section class="mail-section">
      <h2>
        Mail from {sender.name}
      </h2>

      {#if emails.length === 0}
        <div class="empty">
          <p>No emails from this sender yet</p>
        </div>
      {:else}
        <ul class="emails">
          {#each emails as email}
            <li>
              <a
                href="/inbox/{email._id}?from=/subscriptions/{uid}"
                class="email-item"
              >
                <div class="email-header">
                  <span class="subject">{email.subject}</span>
                  <span class="date">{formatDate(email.date)}</span>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {:else}
    <div class="error">Subscription not found</div>
  {/if}
</div>

<style>
  .subscription-detail {
    margin: 0 auto;
    padding: 2rem;
    max-width: 800px;
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }

  .back {
    color: #0066cc;
    text-decoration: none;
  }

  .back:hover {
    text-decoration: underline;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn {
    border-radius: 6px;
    background: #f0f0f0;
    padding: 0.5rem 1rem;
    color: #333;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .edit-btn:hover {
    background: #e0e0e0;
  }

  .delete-btn {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: #cc0000;
    padding: 0.5rem 1rem;
    color: white;
    font-size: 0.9rem;
  }

  .delete-btn:hover {
    background: #aa0000;
  }

  .delete-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading,
  .error,
  .empty {
    padding: 3rem;
    color: #666;
    text-align: center;
  }

  .error {
    color: #cc0000;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .sender-avatar {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    color: white;
    font-weight: 600;
    font-size: 1.5rem;
  }

  .sender-header-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sender-header-info h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .sender-email {
    color: #666;
    font-size: 0.9rem;
  }

  .sender-tags {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.25rem;
  }

  .tag {
    border-radius: 4px;
    background: #eef;
    padding: 0.2rem 0.5rem;
    color: #336;
    font-size: 0.75rem;
  }

  .mail-section h2 {
    margin: 0 0 1rem 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.75rem;
    font-size: 1.1rem;
  }

  .mail-count {
    color: #666;
    font-weight: 400;
    font-size: 0.9rem;
  }

  .emails {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .email-item {
    display: block;
    transition: background 0.15s;
    border-bottom: 1px solid #eee;
    padding: 0.75rem 1rem;
    color: inherit;
    text-decoration: none;
  }

  .email-item:hover {
    background: #f9f9f9;
  }

  .email-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .subject {
    font-weight: 500;
  }

  .date {
    flex-shrink: 0;
    margin-left: 1rem;
    color: #666;
    font-size: 0.85rem;
  }

  .preview {
    overflow: hidden;
    color: #666;
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
