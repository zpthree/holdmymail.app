<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { adminApi, type AdminUser, type ReplaySummary } from "$lib/api";
  import SEO from "$lib/components/SEO.svelte";

  let { data } = $props();

  let fromdate = $state("");
  let todate = $state("");
  let running = $state(false);
  let delivering = $state(false);
  let error = $state("");
  let summary = $state<ReplaySummary | null>(null);
  let digestResult = $state<{ due: number; delivered: number } | null>(null);
  let userQuery = $state("");

  let filteredUsers = $derived.by<AdminUser[]>(() => {
    const query = userQuery.trim().toLowerCase();
    if (!query) return data.users;

    return data.users.filter((user: AdminUser) =>
      [user.username, user.email, user.deliveryEmail].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  });

  function formatJoinedDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function replayInbound() {
    if (!$auth.token) return;
    running = true;
    error = "";
    summary = null;
    try {
      summary = await adminApi.replayInbound($auth.token, {
        fromdate: fromdate || undefined,
        todate: todate || undefined,
      });
    } catch (err) {
      error = err instanceof Error ? err.message : "Replay failed";
    } finally {
      running = false;
    }
  }

  async function deliverDigests() {
    if (!$auth.token) return;
    delivering = true;
    error = "";
    digestResult = null;
    try {
      digestResult = await adminApi.deliverDigests($auth.token);
    } catch (err) {
      error = err instanceof Error ? err.message : "Digest delivery failed";
    } finally {
      delivering = false;
    }
  }
</script>

<SEO
  path="/admin"
  data={{
    meta_title: "Admin",
    meta_description: "Hold My Mail admin tools.",
  }}
/>

<div class="admin-page">
  <h1>Admin</h1>

  {#if error}
    <p class="toast error">{error}</p>
  {/if}

  <section class="card users-card">
    <div class="section-heading">
      <div>
        <h2>Users</h2>
        <p class="hint">
          {data.users.length} registered {data.users.length === 1
            ? "user"
            : "users"}
        </p>
      </div>
      {#if data.users.length > 0}
        <label class="user-search">
          <span class="hidden-visually">Search users</span>
          <input
            type="search"
            placeholder="Search users"
            bind:value={userQuery}
          />
        </label>
      {/if}
    </div>

    {#if data.usersError}
      <p class="inline-error">Could not load users: {data.usersError}</p>
    {:else if data.users.length === 0}
      <p class="empty-state">No users found.</p>
    {:else if filteredUsers.length === 0}
      <p class="empty-state">No users match “{userQuery.trim()}”.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Delivery email</th>
              <th scope="col">Digest</th>
              <th scope="col">Joined</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredUsers as user (user.id)}
              <tr>
                <td data-label="User">
                  <div class="cell-value">
                    <span class="username">
                      {user.username}
                      {#if user.isAdmin}<span class="badge admin">Admin</span
                        >{/if}
                    </span>
                    <a class="email" href="mailto:{user.email}">{user.email}</a>
                    <span
                      class:verified={user.emailVerified}
                      class="verification"
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </td>
                <td data-label="Delivery email">
                  <div class="cell-value">
                    {#if user.deliveryEmail}
                      <a class="email" href="mailto:{user.deliveryEmail}">
                        {user.deliveryEmail}
                      </a>
                    {:else}
                      <span class="muted">Not set</span>
                    {/if}
                  </div>
                </td>
                <td data-label="Digest">
                  <div class="cell-value capitalize">
                    {user.digestFrequency || "none"}
                  </div>
                </td>
                <td data-label="Joined">
                  <div class="cell-value">
                    {formatJoinedDate(user.createdAt)}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <section class="card">
    <h2>Send due digests</h2>
    <p class="hint">
      Sends any held mail whose scheduled time has already passed. Does not
      change delivery settings or reschedule future mail.
    </p>
    {#if digestResult}
      <ul class="summary">
        <li>Due: {digestResult.due}</li>
        <li>Delivered: {digestResult.delivered}</li>
      </ul>
    {/if}
    <button
      type="button"
      class="btn btn-accent"
      disabled={delivering}
      onclick={deliverDigests}
    >
      {delivering ? "Sending…" : "Send due digests now"}
    </button>
  </section>

  <section class="card">
    <h2>Replay inbound mail</h2>
    <p class="hint">
      Pulls inbound messages from Postmark and stores any that were missed while
      the API was down. Messages already in the database are skipped.
    </p>

    {#if summary}
      <ul class="summary">
        <li>Scanned: {summary.scanned}</li>
        <li>Stored: {summary.stored}</li>
        <li>Already had: {summary.duplicate}</li>
        <li>Unknown recipient: {summary.unknownRecipient}</li>
        <li>Invalid: {summary.invalid}</li>
        <li>Errors: {summary.errors}</li>
      </ul>
    {/if}

    <form
      onsubmit={(e) => {
        e.preventDefault();
        replayInbound();
      }}
    >
      <label>
        <span>From date</span>
        <input type="date" bind:value={fromdate} />
      </label>
      <label>
        <span>To date</span>
        <input type="date" bind:value={todate} />
      </label>
      <p class="field-hint">
        Leave dates empty to scan Postmark’s recent inbound history.
      </p>
      <button type="submit" class="btn btn-accent" disabled={running}>
        {running ? "Replaying…" : "Replay inbound mail"}
      </button>
    </form>
  </section>
</div>

<style>
  .admin-page {
    margin: 0 auto;
    padding: 2rem 1rem;
    max-width: 960px;
  }

  h1 {
    margin: 0 0 2rem;
    font-size: var(--fs-xl);
  }

  .card {
    margin-bottom: 2rem;
    border: 1px solid hsl(from var(--text-color) h s l / 0.25);
    border-radius: var(--br-lg);
    padding: 1.5rem;
  }

  .card h2 {
    margin: 0 0 1rem;
    font-size: var(--fs-lg);
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1rem;
  }

  .section-heading .hint {
    margin-top: -0.75rem;
  }

  .user-search {
    width: min(15rem, 100%);
  }

  .user-search input {
    width: 100%;
  }

  .table-wrap {
    margin: 0 -1.5rem -1.5rem;
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: var(--fs-sm);
  }

  th,
  td {
    vertical-align: top;
    border-top: 1px solid hsl(from var(--text-color) h s l / 0.12);
    padding: 0.8rem 1rem;
    text-align: left;
  }

  th {
    color: var(--gray);
    font-weight: 500;
    font-size: var(--fs-xs);
    white-space: nowrap;
  }

  .username {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.15rem;
    font-weight: 600;
  }

  .email {
    display: block;
    width: fit-content;
    word-break: break-word;
  }

  .cell-value {
    min-width: 0;
  }

  .badge,
  .verification {
    display: inline-block;
    border-radius: var(--br-full);
    font-size: var(--fs-xs);
  }

  .badge {
    background: var(--text-color);
    padding: 0.1rem 0.4rem;
    color: var(--bg-color-2);
    font-weight: 500;
  }

  .verification {
    margin-top: 0.3rem;
    color: #9b2c2c;
  }

  .verification.verified {
    color: #287044;
  }

  .muted,
  .empty-state {
    color: var(--gray);
  }

  .empty-state,
  .inline-error {
    margin-bottom: 0;
  }

  .inline-error {
    color: #b71c1c;
  }

  .capitalize {
    text-transform: capitalize;
  }

  .hint {
    margin: -0.5rem 0 1rem;
    color: var(--gray);
    font-size: var(--fs-sm);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  label span {
    font-weight: 600;
    font-size: var(--fs-sm);
  }

  input {
    border: 1px solid hsl(from var(--text-color) h s l / 0.15);
    border-radius: var(--br-md, 0.5rem);
    padding: 0.55rem 0.75rem;
    font: inherit;
    font-size: var(--fs-md);
  }

  .field-hint {
    margin: 0;
    color: var(--gray);
    font-size: var(--fs-xs, 0.75rem);
  }

  .btn {
    align-self: start;
    padding-inline: 1.5rem;
  }

  .toast {
    border-radius: var(--br-lg);
    padding: 0.65rem 1rem;
    font-weight: 500;
    font-size: var(--fs-sm);
  }

  .toast.error {
    border: 1px solid #d33;
    background: #fdecea;
    color: #b71c1c;
  }

  .summary {
    margin: 0 0 1rem;
    padding-left: 1.25rem;
    font-size: var(--fs-sm);
  }

  @media (max-width: 640px) {
    .section-heading {
      flex-direction: column;
    }

    .user-search {
      width: 100%;
    }

    .table-wrap {
      overflow: visible;
    }

    thead {
      display: none;
    }

    table,
    tbody,
    tr,
    td {
      display: block;
    }

    tr {
      border-top: 1px solid hsl(from var(--text-color) h s l / 0.12);
      padding: 0.75rem 1.5rem;
    }

    td {
      display: grid;
      grid-template-columns: 7rem minmax(0, 1fr);
      border: 0;
      padding: 0.35rem 0;
    }

    td::before {
      content: attr(data-label);
      color: var(--gray);
      font-size: var(--fs-xs);
    }
  }
</style>
