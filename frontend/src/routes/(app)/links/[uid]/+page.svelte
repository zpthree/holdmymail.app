<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { linkApi, type Link } from "$lib/api";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let link = $state<Link | null>(data.link);
  let error = $state("");
  let deleting = $state(false);

  const uid = $derived($page.params.uid);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function hostname(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  async function handleDelete() {
    if (!$auth.token || !uid || !confirm("Delete this link?")) return;

    deleting = true;
    try {
      await linkApi.delete(uid, $auth.token);
      goto("/links");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete link";
      deleting = false;
    }
  }
</script>

<div class="link-detail">
  <nav class="back-nav">
    <a href="/links">← Back to Links</a>
  </nav>

  {#if !link}
    <p class="error">Link not found</p>
  {:else}
    <header>
      <h1>{link.title || link.ogTitle || link.url}</h1>
      <div class="meta">
        {#if link.favicon}
          <img
            src={link.favicon}
            alt=""
            class="favicon"
            width="16"
            height="16"
            onerror={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        {/if}
        <a
          href={`https://${hostname(link.url)}`}
          target="_blank"
          rel="noopener noreferrer"
          class="url"
        >
          {link.ogSiteName || hostname(link.url)} ↗
        </a>
        <span class="date">{formatDate(link._creationTime)}</span>
      </div>
    </header>

    {#if link.ogImage}
      <div class="og-image">
        <img
          src={link.ogImage}
          alt={link.ogTitle || link.title || ""}
          onerror={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.parentElement!.style.display = "none";
          }}
        />
      </div>
    {/if}

    {#if link.tags.length > 0}
      <div class="tags">
        {#each link.tags as tag}
          <span class="tag">{tag.name}</span>
        {/each}
      </div>
    {/if}

    {#if link.description || link.ogDescription}
      <div class="description">
        <p>{link.description || link.ogDescription}</p>
      </div>
    {/if}

    <div class="actions">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        class="btn primary"
      >
        Open Link ↗
      </a>
      <button class="btn danger" onclick={handleDelete} disabled={deleting}>
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}
  {/if}
</div>

<style>
  .link-detail {
    margin: 0 auto;
    padding: 2rem 1rem;
    max-width: var(--container-width);
  }

  .back-nav {
    margin-bottom: 1.5rem;
  }

  .back-nav a {
    color: var(--black);
    font-weight: 500;
    font-size: var(--fs-sm);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  header {
    margin-bottom: 1rem;
  }

  h1 {
    margin: 0 0 0.5rem;
    font-size: var(--fs-xl);
    line-height: 1.2;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: var(--fs-sm);
  }

  .favicon {
    border-radius: 2px;
  }

  .url {
    color: var(--accent, var(--black));
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .og-image {
    margin-bottom: 1.25rem;
    border: 1px solid var(--light-gray, #e5e5e5);
    border-radius: var(--br-lg);
    overflow: hidden;
  }

  .og-image img {
    display: block;
    width: 100%;
    max-height: 400px;
    object-fit: cover;
  }

  .date {
    color: var(--gray);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 1.25rem;
  }

  .tag {
    border-radius: var(--br-full);
    background: var(--black);
    padding: 0.2rem 0.6rem;
    color: var(--white);
    font-weight: 500;
    font-size: var(--fs-xs);
  }

  .description {
    margin-bottom: 1.5rem;
    font-size: var(--fs-md);
    line-height: 1.5;
  }

  .description p {
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: var(--br-lg);
    padding: 0.55rem 1.25rem;
    font: inherit;
    font-weight: 600;
    font-size: var(--fs-sm);
    text-decoration: none;
  }

  .btn.primary {
    background: var(--black);
    color: var(--white);

    &:hover {
      opacity: 0.85;
    }
  }

  .btn.danger {
    border: 1px solid var(--accent);
    background: transparent;
    color: var(--accent);

    &:hover {
      background: var(--accent);
      color: var(--white);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .error {
    margin-top: 1rem;
    color: #d33;
    font-size: var(--fs-sm);
  }
</style>
