<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { emailApi, type Email } from "$lib/api";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let email = $state<Email | null>(data.email);
  let error = $state("");
  let deleting = $state(false);
  let showSchedule = $state(false);
  let scheduleDate = $state("");
  let scheduleTime = $state("09:00");
  let scheduling = $state(false);

  const uid = $derived($page.params.uid);
  const backHref = $derived(data.from ?? "/inbox");
  const backLabel = $derived(
    backHref.startsWith("/subscriptions")
      ? "Back to Subscription"
      : "Back to Inbox",
  );

  async function handleDelete() {
    if (!$auth.token || !uid || !confirm("Delete this email?")) return;

    deleting = true;
    try {
      await emailApi.delete(uid, $auth.token);
      goto("/inbox");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete email";
      deleting = false;
    }
  }

  async function handleSchedule() {
    if (!$auth.token || !uid || !scheduleDate) return;

    scheduling = true;
    try {
      const scheduledFor = new Date(
        `${scheduleDate}T${scheduleTime}`,
      ).toISOString();
      await emailApi.schedule([uid], scheduledFor, $auth.token);
      if (email)
        email.scheduledFor = new Date(
          `${scheduleDate}T${scheduleTime}`,
        ).getTime();
      showSchedule = false;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to schedule email";
    } finally {
      scheduling = false;
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: $auth.user?.timezone || undefined,
    });
  }
</script>

<div class="email-container">
  <nav>
    <a href={backHref} class="back">← {backLabel}</a>
    {#if email}
      <div class="actions">
        <button
          class="schedule-btn"
          onclick={() => (showSchedule = !showSchedule)}
        >
          {showSchedule ? "Cancel" : "Schedule"}
        </button>
        <button onclick={handleDelete} disabled={deleting} class="delete">
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    {/if}
  </nav>

  <header>
    <h1 style="font-size: var(--fs-xl)">{email?.subject}</h1>
  </header>

  <div class="email-view">
    {#if showSchedule}
      <form class="schedule-form" onsubmit={handleSchedule}>
        <div class="schedule-fields">
          <input type="date" bind:value={scheduleDate} required />
          <input type="time" bind:value={scheduleTime} required />
          <button type="submit" disabled={scheduling}>
            {scheduling ? "Scheduling..." : "Confirm"}
          </button>
        </div>
        {#if email?.scheduledFor}
          <p class="scheduled-info">
            Currently scheduled for {formatDate(
              new Date(email.scheduledFor).toISOString(),
            )}
          </p>
        {/if}
      </form>
    {/if}

    {#if error}
      <div class="error">{error}</div>
    {:else if email}
      <article>
        <header>
          <div class="meta">
            <div class="from">
              <strong>From:</strong>
              <a href={`/subscriptions/${email.senderId}`}
                >{email.fromName} &lt;{email.fromEmail}&gt;</a
              >
            </div>
            <div class="to">
              <strong>To:</strong>
              {email.to}
            </div>
            <div class="date">
              <strong>Date:</strong>
              {formatDate(email.date)}
            </div>
          </div>
        </header>

        <div class="body">
          {#if email.htmlBody}
            <iframe
              class="html-body"
              sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              title="Email content"
              srcdoc={email.htmlBody}
              onload={(e) => {
                const iframe = /** @type {HTMLIFrameElement} */ (
                  e.currentTarget
                );
                const doc = iframe.contentDocument;
                if (doc) {
                  // reset default margins
                  doc.body.style.margin = "0";
                  doc.body.style.fontFamily = "Rubik, sans-serif";
                  iframe.style.height = doc.documentElement.scrollHeight + "px";
                }
              }}
            ></iframe>
          {:else}
            <pre>{email.textBody}</pre>
          {/if}
        </div>
      </article>
    {:else}
      <div class="error">Email not found</div>
    {/if}
  </div>
</div>

<style>
  .email-container {
    margin: 0 auto;
    padding: 2rem 0.5rem;
    max-width: var(--container-width);
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

  .schedule-btn {
    cursor: pointer;
    border: 1px solid var(--black);
    border-radius: 4px;
    background: transparent;
    padding: 0.5rem 1rem;
    color: var(--black);
  }

  .schedule-btn:hover {
    background: var(--black);
    color: var(--white);
  }

  .delete {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: #cc0000;
    padding: 0.5rem 1rem;
    color: white;
  }

  .delete:hover {
    background: #aa0000;
  }

  .delete:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .schedule-form {
    margin-bottom: 1.5rem;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1rem;
  }

  .schedule-fields {
    display: flex;
    gap: 0.5rem;
  }

  .schedule-fields input {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .schedule-fields input:focus {
    outline: none;
    border-color: var(--black);
  }

  .schedule-fields button {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: var(--black);
    padding: 0.5rem 1rem;
    color: var(--white);
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .schedule-fields button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .scheduled-info {
    margin: 0.5rem 0 0;
    color: #666;
    font-size: 0.85rem;
  }

  .error {
    padding: 3rem;
    color: #666;
    text-align: center;
  }

  .error {
    color: #cc0000;
  }

  article {
    border: 0.3rem solid var(--black);
    border-radius: var(--br-lg);
    background: var(--white);
  }

  article header {
    background-color: var(--black);
    padding: 1.5rem;
  }

  h1 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .meta {
    color: var(--white);
    font-size: var(--fs-sm);
    line-height: 1.6;
  }

  .meta strong {
    display: inline-block;
    width: 3rem;
    color: var(--offwhite);
    font-weight: 500;
  }

  .meta .from a {
    color: var(--white);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .body {
    padding: 1.5rem;
    overflow-x: auto;
  }

  .html-body {
    display: block;
    border: none;
    width: 100%;
    overflow: hidden;
  }

  .body pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
  }
</style>
