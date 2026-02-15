<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { emailApi, type Email } from "$lib/api";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import SEO from "$lib/components/SEO.svelte";

  let {
    data,
    shallow,
  }: { data: { email: Email | null; from?: string }; shallow: boolean } =
    $props();
  let scheduledOverride = $state<number | null>(null);
  let email = $derived<(Email & { scheduledFor?: number }) | null>(
    data.email
      ? {
          ...data.email,
          ...(scheduledOverride !== null
            ? { scheduledFor: scheduledOverride }
            : {}),
        }
      : null,
  );
  let error = $state("");
  let deleting = $state(false);
  let showSchedule = $state(false);
  let scheduleDate = $state("");
  let scheduleTime = $state("09:00");
  let scheduling = $state(false);

  const uid = $derived($page.params.uid);
  const backHref = $derived(data.from ?? "/inbox");
  const backLabel = $derived(
    backHref.startsWith("/sources") ? "Back to Source" : "Back to Inbox",
  );

  // mark email as read when page actually loads (not during preload)
  $effect(() => {
    if (email && !email.read && $auth.token) {
      emailApi.markRead(uid, $auth.token).catch(() => {});
    }
  });

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
      scheduledOverride = new Date(`${scheduleDate}T${scheduleTime}`).getTime();
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

  export async function handleDigestLinkClick(e: MouseEvent): Promise<void> {
    const target = e.target as HTMLAnchorElement;
    if (target.tagName === "A" && target.href) {
      e.preventDefault();
      window.open(target.href, "_blank");
    }
  }
</script>

<SEO
  path={`/inbox/${uid}`}
  data={{
    meta_title: email?.subject || "Inbox",
    meta_description: "View your email",
  }}
/>

<div class="email-container">
  <nav>
    {#if !shallow}
      <a href={backHref} class="back">← {backLabel}</a>
    {/if}

    {#if email}
      <div class="actions">
        <button
          class="btn btn-white"
          onclick={() => (showSchedule = !showSchedule)}
        >
          {showSchedule ? "Cancel" : "Schedule"}
        </button>
        <button
          onclick={handleDelete}
          disabled={deleting}
          class="btn btn-accent"
        >
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
              <a href={`/sources/${email.senderId}`}
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

        <div class="body" onclick={handleDigestLinkClick}>
          {#if email.htmlBody}
            {@html email.htmlBody}
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

    @media (min-width: 400px) {
      padding: 2rem;
    }
  }

  nav {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }

  .back {
    margin-right: auto;
    color: var(--text-color);
    font-weight: 500;
    font-size: var(--fs-sm);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding-block: 0.35rem;
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
    border-color: var(--text-color);
  }

  .schedule-fields button {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: var(--text-color);
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
    background: var(--bg-color-2);
    overflow: hidden;
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
    margin: auto;
    max-width: 600px;
  }

  .body pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
  }
</style>
