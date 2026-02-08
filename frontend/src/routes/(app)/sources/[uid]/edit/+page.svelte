<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { senderApi, type Sender } from "$lib/api";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let sender = $state<Sender | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");
  let saveError = $state("");

  // Form fields
  let name = $state("");
  let email = $state("");
  let color = $state("#0066cc");
  let tags = $state("");
  let digestFrequency = $state("");
  let digestDay = $state("monday");
  let digestTime = $state("09:00");

  const uid = $derived($page.params.uid);

  onMount(async () => {
    if (!$auth.token || !uid) return;

    try {
      sender = await senderApi.get(uid, $auth.token);
      name = sender.name;
      email = sender.email;
      color = sender.color || "#0066cc";
      tags = sender.tags.map((t) => t.name).join(", ");
      digestFrequency = sender.digestFrequency || "";
      digestDay = sender.digestDay || "monday";
      digestTime = sender.digestTime || "09:00";
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load source";
    } finally {
      loading = false;
    }
  });

  async function handleSave() {
    if (!$auth.token || !uid) return;

    saving = true;
    saveError = "";

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await senderApi.update(
        uid,
        {
          name: name.trim(),
          email: email.trim(),
          color,
          tags: tagList,
          digestFrequency: digestFrequency || undefined,
          digestDay: digestFrequency === "weekly" ? digestDay : undefined,
          digestTime:
            digestFrequency && digestFrequency !== "realtime"
              ? digestTime
              : undefined,
        },
        $auth.token,
      );

      goto(`/sources/${uid}`);
    } catch (err) {
      saveError = err instanceof Error ? err.message : "Failed to save changes";
    } finally {
      saving = false;
    }
  }
</script>

<div class="edit-source">
  <nav>
    <a href="/sources/{uid}" class="back">← Back</a>
  </nav>

  {#if loading}
    <div class="loading">Loading...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if sender}
    <h1>Edit {sender.name}</h1>

    <form onsubmit={handleSave}>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" type="text" bind:value={name} required />
      </div>

      <div class="field">
        <label for="email">Email address</label>
        <input id="email" type="email" bind:value={email} required />
      </div>

      <div class="field">
        <label for="tags"
          >Tags <span class="label-hint">comma-separated</span></label
        >
        <input
          id="tags"
          type="text"
          bind:value={tags}
          placeholder="newsletter, tech, weekly"
        />
      </div>

      <div class="field">
        <label for="color">Color</label>
        <div class="color-picker">
          {#each ["#0066cc", "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#64748b", "#78716c"] as swatch}
            <button
              type="button"
              class="color-swatch"
              class:active={color === swatch}
              style="background: {swatch}"
              onclick={() => (color = swatch)}
              aria-label="Select color {swatch}"
            ></button>
          {/each}
        </div>
        <div class="color-preview">
          <input
            id="color"
            type="color"
            bind:value={color}
            class="hidden-visually color-input"
            title="Pick a custom color"
          />
          <label for="color" class="preview-avatar" style="background: {color}">
            {name ? name.charAt(0).toUpperCase() : "?"}
          </label>
          <span class="color-value">{color}</span>
        </div>
      </div>

      <!-- Schedule section -->
      <fieldset class="schedule">
        <legend>Delivery Schedule</legend>
        <p class="schedule-hint">
          Control when emails from this sender get delivered. Leave as "Use
          default" to inherit your account-level delivery settings.
        </p>

        <div class="field">
          <label for="frequency">Frequency</label>
          <select id="frequency" bind:value={digestFrequency}>
            <option value="">Use default</option>
            <option value="realtime">Real-time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {#if digestFrequency === "weekly"}
          <div class="field">
            <label for="digest-day">Delivery day</label>
            <select id="digest-day" bind:value={digestDay}>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        {/if}

        {#if digestFrequency && digestFrequency !== "realtime"}
          <div class="field">
            <label for="delivery-time">Delivery time</label>
            <input id="delivery-time" type="time" bind:value={digestTime} />
          </div>
        {/if}
      </fieldset>

      {#if saveError}
        <p class="save-error">{saveError}</p>
      {/if}

      <div class="form-actions">
        <a href="/sources/{uid}" class="btn btn-white">Cancel</a>
        <button type="submit" disabled={saving} class="btn btn-black">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  {:else}
    <div class="error">Source not found</div>
  {/if}
</div>

<style>
  .edit-source {
    margin: 0 auto;
    padding: 2rem;
    max-width: 600px;
  }

  nav {
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }

  .back {
    color: var(--black);
    font-weight: 500;
    font-size: var(--fs-sm);
    text-decoration: none;
  }

  .back:hover {
    text-decoration: underline;
  }

  h1 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
  }

  .field {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    margin-bottom: 0.375rem;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .label-hint {
    color: #666;
    font-weight: 400;
    font-size: 0.8rem;
  }

  input,
  select {
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    width: 100%;
    font-size: 0.9rem;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #0066cc;
  }

  input:disabled,
  select:disabled {
    cursor: not-allowed;
    background: #f5f5f5;
    color: #999;
  }

  .schedule {
    margin: 1.5rem 0;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .schedule legend {
    padding: 0 0.5rem;
    font-weight: 600;
    font-size: 1rem;
  }

  .schedule-hint {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.85rem;
  }

  .color-picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .color-swatch {
    transition:
      border-color 0.15s,
      transform 0.15s;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 50%;
    padding: 0;
    width: 28px;
    height: 28px;
  }

  .color-swatch:hover {
    transform: scale(1.15);
  }

  .color-swatch.active {
    box-shadow:
      0 0 0 2px white,
      0 0 0 4px var(--nutmeg-400, #666);
    border-color: var(--nutmeg-950, #333);
  }

  .color-input {
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 50%;
    padding: 0;
    width: 28px;
    height: 28px;
    overflow: hidden;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .color-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .preview-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
  }

  .color-value {
    color: #666;
    font-size: 0.8rem;
    font-family: monospace;
  }

  .save-error {
    margin-bottom: 1rem;
    color: #cc0000;
    font-size: 0.85rem;
  }

  .loading,
  .error {
    padding: 3rem;
    color: #666;
    text-align: center;
  }

  .error {
    color: #cc0000;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-top: 1px solid #eee;
    padding-top: 1rem;
  }

  .cancel-btn {
    border-radius: 6px;
    background: #f0f0f0;
    padding: 0.5rem 1rem;
    color: #333;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .cancel-btn:hover {
    background: #e0e0e0;
  }

  .save-btn {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: #0066cc;
    padding: 0.5rem 1.25rem;
    color: white;
    font-size: 0.9rem;
  }

  .save-btn:hover {
    background: #0055aa;
  }

  .save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
