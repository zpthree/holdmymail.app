<script lang="ts">
  import { auth, clearAuth } from "$lib/stores/auth";
  import { authApi } from "$lib/api";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import SEO from "$lib/components/SEO.svelte";

  let { data } = $props();

  const uid = $derived($page.params.uid);

  // Redirect if viewing another user's page
  $effect(() => {
    if ($auth.user && uid !== $auth.user.username) {
      goto(`/user/${$auth.user.username}`);
    }
  });

  // Initial values from loaded data
  // eslint-disable-next-line -- intentionally capturing initial load values for form fields
  const loadedUser = data.user;
  const {
    email: initialEmail = "",
    deliveryEmail: initialDeliveryEmail = loadedUser?.deliveryEmail || "",
    digestFrequency: initialDigestFrequency = "none",
    digestDay: initialDigestDay = "monday",
    digestTime: initialDigestTime = "09:00",
    timezone: initialTimezone = "",
    username = "",
    createdAt = 0,
  } = loadedUser ?? {};
  const seoUserId = loadedUser?.id || uid;
  const seoTitle = loadedUser?.username || "Account Settings";

  // Account fields
  let email = $state(initialEmail);
  let currentPassword = $state("");
  let newPassword = $state("");

  // Delivery settings
  let deliveryEmail = $state(initialDeliveryEmail || email);
  let digestFrequency = $state(initialDigestFrequency);
  let digestDay = $state(initialDigestDay);
  let digestTime = $state(initialDigestTime);
  let timezone = $state(
    initialTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  // UI state
  let saving = $state(false);
  let savingDelivery = $state(false);
  let changingPassword = $state(false);
  let deletingAccount = $state(false);
  let message = $state("");
  let error = $state("");

  function showMessage(msg: string) {
    message = msg;
    error = "";
    setTimeout(() => (message = ""), 3000);
  }

  function showError(msg: string) {
    error = msg;
    message = "";
  }

  async function updateEmail() {
    if (!$auth.token || !$auth.user) return;
    if (!email.trim()) return showError("Email is required");

    saving = true;
    error = "";
    try {
      await authApi.updateUser(
        $auth.user.id,
        { email: email.trim() },
        $auth.token,
      );
      showMessage("Email updated");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      saving = false;
    }
  }

  async function changePassword() {
    if (!$auth.token || !$auth.user) return;
    if (!currentPassword) return showError("Current password is required");
    if (!newPassword) return showError("New password is required");
    if (newPassword.length < 8)
      return showError("Password must be at least 8 characters");

    changingPassword = true;
    error = "";
    try {
      await authApi.updateUser(
        $auth.user.id,
        { currentPassword, password: newPassword },
        $auth.token,
      );
      currentPassword = "";
      newPassword = "";
      showMessage("Password updated");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      changingPassword = false;
    }
  }

  async function saveDeliverySettings() {
    if (!$auth.token || !$auth.user) return;

    savingDelivery = true;
    error = "";
    try {
      await authApi.updateUser(
        $auth.user.id,
        {
          deliveryEmail: deliveryEmail.trim(),
          digestFrequency,
          digestDay,
          digestTime,
          timezone,
        },
        $auth.token,
      );
      showMessage("Delivery settings saved");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      savingDelivery = false;
    }
  }

  async function deleteAccount() {
    if (!$auth.token || !$auth.user) return;
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;
    if (
      !confirm(
        "This will permanently delete all your emails, links, and data. Continue?",
      )
    )
      return;

    deletingAccount = true;
    try {
      await authApi.deleteUser($auth.user.id, $auth.token);
      clearAuth();
      goto("/auth/login");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete account",
      );
      deletingAccount = false;
    }
  }
</script>

<SEO
  path={`/user/${seoUserId}`}
  data={{
    meta_title: seoTitle,
    meta_description: "Manage your Hold My Mail account settings.",
  }}
/>

<div class="user-page">
  <h1>Account Settings</h1>

  {#if message}
    <div class="toast success">{message}</div>
  {/if}
  {#if error}
    <div class="toast error">{error}</div>
  {/if}

  <!-- Logout -->
  <section class="card flex">
    <h2>Logout</h2>
    <a href="/auth/logout" class="btn btn-accent">Log out</a>
  </section>

  <!-- Email Section -->
  <section class="card">
    <h2>Email Address</h2>
    <form
      onsubmit={(e) => {
        e.preventDefault();
        updateEmail();
      }}
    >
      <label>
        <span>Email</span>
        <input type="email" bind:value={email} required />
      </label>
      <button type="submit" class="btn btn-black" disabled={saving}>
        {saving ? "Saving…" : "Update Email"}
      </button>
    </form>
  </section>

  <!-- Password Section -->
  <section class="card">
    <h2>Change Password</h2>
    <form
      onsubmit={(e) => {
        e.preventDefault();
        changePassword();
      }}
    >
      <label>
        <span>Current Password</span>
        <input type="password" bind:value={currentPassword} required />
      </label>
      <label>
        <span>New Password</span>
        <input
          type="password"
          bind:value={newPassword}
          minlength="8"
          required
        />
      </label>
      <button type="submit" class="btn btn-black" disabled={changingPassword}>
        {changingPassword ? "Updating…" : "Change Password"}
      </button>
    </form>
  </section>

  <!-- Delivery Settings Section -->
  <section class="card">
    <h2>Mail Delivery</h2>
    <p class="hint">
      Configure how and when your held emails are delivered to you.
    </p>
    <form
      onsubmit={(e) => {
        e.preventDefault();
        saveDeliverySettings();
      }}
    >
      <label>
        <span>Delivery Email</span>
        <input
          type="email"
          bind:value={deliveryEmail}
          placeholder="Where to send digests (defaults to account email)"
        />
      </label>
      <label>
        <span>Digest Frequency</span>
        <select bind:value={digestFrequency}>
          <option value="none">None (manual only)</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      {#if digestFrequency === "weekly"}
        <label>
          <span>Day of Week</span>
          <select bind:value={digestDay}>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </label>
      {/if}
      {#if digestFrequency !== "none"}
        <label>
          <span>Delivery Time</span>
          <input type="time" bind:value={digestTime} />
        </label>
      {/if}
      <label>
        <span>Timezone</span>
        <select bind:value={timezone}>
          {#each Intl.supportedValuesOf("timeZone") as tz}
            <option value={tz}>{tz.replace(/_/g, " ")}</option>
          {/each}
        </select>
        <span class="field-hint">Used for scheduling delivery times</span>
      </label>
      <button type="submit" class="btn btn-black" disabled={savingDelivery}>
        {savingDelivery ? "Saving…" : "Save Delivery Settings"}
      </button>
    </form>
  </section>

  <!-- Account Info -->
  <section class="card">
    <h2>Account Info</h2>
    <dl class="info-grid">
      <dt>Username</dt>
      <dd>{username || "—"}</dd>
      <dt>Mail Address</dt>
      <dd>{username || "user"}@inbox.holdmymail.app</dd>
      <dt>Member Since</dt>
      <dd>
        {createdAt
          ? new Date(createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "—"}
      </dd>
    </dl>
  </section>

  <!-- Danger Zone -->
  <section class="card danger-zone">
    <h2>Danger Zone</h2>
    <p>Permanently delete your account and all associated data.</p>
    <button
      class="btn btn-accent"
      onclick={deleteAccount}
      disabled={deletingAccount}
    >
      {deletingAccount ? "Deleting…" : "Delete Account"}
    </button>
  </section>
</div>

<style>
  .user-page {
    margin: 0 auto;
    padding: 2rem 1rem;
    max-width: 640px;
  }

  h1 {
    margin: 0 0 2rem;
    font-size: var(--fs-xl);
  }

  .toast {
    margin-bottom: 1.5rem;
    border-radius: var(--br-lg);
    padding: 0.65rem 1rem;
    font-weight: 500;
    font-size: var(--fs-sm);
  }

  .toast.success {
    border: 1px solid #2a9d4a;
    background: #e8f5e9;
    color: #1b5e20;
  }

  .toast.error {
    border: 1px solid #d33;
    background: #fdecea;
    color: #b71c1c;
  }

  .card {
    margin-bottom: 2rem;
    border: 1px solid hsl(from var(--text-color) h s l / 0.25);
    border-radius: var(--br-lg);
    padding: 1.5rem;
  }

  .card.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card h2 {
    margin: 0;
    font-size: var(--fs-lg);
  }

  .card:not(.flex) h2 {
    margin: 0 0 1rem;
  }

  .card .hint {
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

  .field-hint {
    color: var(--gray);
    font-weight: 400;
    font-size: var(--fs-xs, 0.75rem);
  }

  input,
  select {
    border: 1px solid hsl(from var(--text-color) h s l / 0.15);
    border-radius: var(--br-md, 0.5rem);
    padding: 0.55rem 0.75rem;
    font: inherit;
    font-size: var(--fs-md);

    &:focus {
      outline: none;
      border-color: var(--text-color);
    }
  }

  select {
    cursor: pointer;
    background: var(--white, #fff);
  }

  .info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1.5rem;
    margin: 0;
    font-size: var(--fs-sm);
  }

  .info-grid dt {
    color: var(--gray);
    font-weight: 600;
  }

  .info-grid dd {
    margin: 0;
  }

  .btn {
    align-self: start;
    padding-inline: 1.5rem;
  }

  .danger-zone {
    border-color: var(--accent);
  }

  .danger-zone h2 {
    color: var(--accent);
  }

  .danger-zone p {
    margin: 0 0 1rem;
    font-size: var(--fs-sm);
  }
</style>
