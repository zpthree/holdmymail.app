<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { adminApi, type ReplaySummary } from "$lib/api";
  import SEO from "$lib/components/SEO.svelte";

  let fromdate = $state("");
  let todate = $state("");
  let running = $state(false);
  let delivering = $state(false);
  let error = $state("");
  let summary = $state<ReplaySummary | null>(null);
  let digestResult = $state<{ due: number; delivered: number } | null>(null);

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
      <p class="field-hint">Leave dates empty to scan Postmark’s recent inbound history.</p>
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
    max-width: 640px;
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
</style>
