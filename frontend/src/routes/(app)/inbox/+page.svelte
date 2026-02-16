<script lang="ts">
  import { emailApi, type Email } from "$lib/api";
  import { auth } from "$lib/stores/auth";
  import { invalidateAll } from "$app/navigation";
  import { PAGE_SIZE } from "$lib/constants";
  import SEO from "$lib/components/SEO.svelte";

  let { data } = $props();

  // Paginated state (seeded from initial load, then mutated by loadMore)
  let extraEmails = $state<Email[]>([]);
  let cursor = $state<string | null>(null);
  let hasMore = $state(false);
  let loadingMore = $state(false);
  let pageInit = $state(false);

  $effect(() => {
    if (!pageInit) {
      cursor = data.cursor;
      hasMore = data.hasMore;
      pageInit = true;
    }
  });

  let emails = $derived.by<Email[]>(() => {
    if (extraEmails.length === 0) return data.emails;
    const seen = new Set(data.emails.map((e) => e._id));
    const unique = extraEmails.filter((e) => !seen.has(e._id));
    return [...data.emails, ...unique];
  });

  async function loadMore() {
    if (!$auth.token || !cursor || loadingMore) return;
    loadingMore = true;
    try {
      const result = await emailApi.listPaginated(
        $auth.token,
        PAGE_SIZE,
        cursor,
      );
      extraEmails = [...extraEmails, ...result.items];
      cursor = result.hasMore ? result.cursor : null;
      hasMore = result.hasMore;
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      loadingMore = false;
    }
  }

  type Filter = "confirmations" | "all";
  let filter = $state<Filter>("confirmations");

  let filteredEmails = $derived(
    filter === "confirmations"
      ? emails.filter((e) => /confirm/i.test(e.subject || ""))
      : emails,
  );

  type DateGroup = { month: string; day: string; emails: Email[] };

  let grouped = $derived<DateGroup[]>(groupByDate(filteredEmails));

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
    if (selected.size === emails.length) {
      selected = new Set();
    } else {
      selected = new Set(emails.map((e) => e._id));
    }
  }

  async function bulkDelete() {
    if (!$auth.token || selected.size === 0) return;
    if (
      !confirm(`Delete ${selected.size} email${selected.size > 1 ? "s" : ""}?`)
    )
      return;

    deleting = true;
    try {
      await emailApi.bulkDelete([...selected], $auth.token);
      selected = new Set();
      await invalidateAll();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      deleting = false;
    }
  }

  function groupByDate(emails: Email[]): DateGroup[] {
    const tz = $auth.user?.timezone || undefined;
    const groups = new Map<string, Email[]>();

    for (const email of emails) {
      const date = new Date(email.date);
      const key = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: tz,
      });

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(email);
    }

    return Array.from(groups.entries()).map(([key, emails]) => {
      const date = new Date(emails[0].date);
      const month = date
        .toLocaleDateString("en-US", { month: "short", timeZone: tz })
        .toUpperCase();
      const day = date.toLocaleDateString("en-US", {
        day: "numeric",
        timeZone: tz,
      });

      return { month, day, emails };
    });
  }
</script>

<SEO
  path="/inbox"
  data={{
    meta_title: "Inbox",
    meta_description: "Manage your emails",
  }}
/>

<div class="mail-list">
  <header>
    <div class="header-top">
      <h1 style="font-size: var(--fs-xl)">Inbox</h1>
      <div class="filter-tabs">
        <button
          class="filter-tab"
          class:active={filter === "confirmations"}
          onclick={() => (filter = "confirmations")}
        >
          Confirmations
        </button>
        <button
          class="filter-tab"
          class:active={filter === "all"}
          onclick={() => (filter = "all")}
        >
          All
        </button>
      </div>
    </div>
    {#if filteredEmails.length > 0}
      <div class="bulk-actions">
        {#if selectMode}
          <button class="btn btn-white" onclick={toggleAll}>
            {selected.size === emails.length ? "Deselect All" : "Select All"}
          </button>
          {#if selecting}
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

  {#if filteredEmails.length === 0}
    <div class="empty">
      <p>
        {filter === "confirmations"
          ? "No confirmation emails"
          : "No emails yet"}
      </p>
      <p class="hint">
        {filter === "confirmations"
          ? 'Emails with "confirm" in the subject will appear here'
          : "Emails sent to your @inbox.holdmymail.app address will appear here"}
      </p>
    </div>
  {:else}
    {#each grouped as group}
      <section class="date-group">
        <h2 class="date-label">
          <span class="month">{group.month}</span>
          <span class="day">{group.day}</span>
        </h2>
        <ul class="emails">
          {#each group.emails as email}
            <li data-read={email.read} class:selected={selected.has(email._id)}>
              {#if selectMode}
                <label class="checkbox">
                  <input
                    type="checkbox"
                    checked={selected.has(email._id)}
                    onchange={() => toggleSelect(email._id)}
                  />
                </label>
              {/if}
              <div class="email-content">
                <a href="/sources/{email.senderId}" class="sender">
                  <span>{email.fromName || email.fromEmail}</span>
                </a>
                <a href="/inbox/{email._id}" class="email-item">
                  {email.subject}
                </a>
                {#if email.scheduledFor && !email.delivered}
                  <span class="scheduled"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><circle cx="12" cy="12" r="10" /><polyline
                        points="12 6 12 12 16 14"
                      /></svg
                    >
                    {new Date(email.scheduledFor).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: $auth.user?.timezone || undefined,
                    })}</span
                  >
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/each}

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
  .mail-list {
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

  .header-top {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .filter-tabs {
    display: flex;
    gap: 0.25rem;
    border-radius: var(--br-full);
    background: oklch(from var(--text-color) 0.2 c h);
    padding: 0.2rem;
  }

  .filter-tab {
    transition:
      background 150ms,
      color 150ms;
    cursor: pointer;
    border: none;
    border-radius: var(--br-full);
    background: transparent;
    padding: 0.3rem 0.75rem;
    color: var(--text-color);
    font-weight: 600;
    font-size: var(--fs-sm);

    &.active {
      background: var(--accent);
      color: var(--white);
    }

    &:not(.active):hover {
      background: oklch(from var(--text-color) 0.3 c h);
    }
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

  .btn {
    padding-block: 0.35rem;
  }

  .checkbox {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    cursor: pointer;
    padding-top: 0.15rem;
  }

  .checkbox input {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    accent-color: var(--accent);
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

  .emails {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .emails li:not(:last-child) {
    margin-bottom: 1.5rem;
  }

  .emails li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .emails li.selected {
    margin-left: -0.5rem;
    border-radius: var(--br-md, 0.5rem);
    background: hsl(from var(--accent) h s l / 0.06);
    padding: 0.35rem 0.5rem;
  }

  .email-content {
    min-width: 0;
  }

  .sender,
  .email-item {
    color: var(--text-color);

    &:hover {
      text-decoration: underline;
    }
  }

  .email-item {
    display: block;
    transition: background 0.15s;
    color: inherit;
    font-weight: 600;
    font-size: var(--fs-md);
    text-decoration: none;
  }

  .sender {
    position: relative;
    margin-bottom: 0.25rem;
    color: var(--accent);
    font-weight: 500;
    font-size: var(--fs-sm);
    text-decoration: none;
  }

  .emails > li[data-read="false"] .sender::after {
    display: block;
    position: absolute;
    top: 0.2rem;
    right: -1rem;
    border-radius: var(--br-circle);
    background: var(--accent);
    width: 0.4em;
    height: 0.4em;
    content: "";
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
