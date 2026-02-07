<script lang="ts">
  let email = $state("");
  let submitted = $state(false);
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;

    // TODO: Implement forgot password API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    submitted = true;
    loading = false;
  }
</script>

<h1>Forgot Password</h1>

{#if submitted}
  <p class="success">
    If an account exists with that email, you'll receive a password reset link.
  </p>
  <a href="/auth/login" class="back">Back to login</a>
{:else}
  <form onsubmit={handleSubmit}>
    <label>
      Email
      <input type="email" bind:value={email} required />
    </label>

    <button type="submit" disabled={loading}>
      {loading ? "Sending..." : "Send Reset Link"}
    </button>
  </form>

  <p class="links">
    <a href="/auth/login">Back to login</a>
  </p>
{/if}

<style>
  h1 {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-weight: 500;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .success {
    background: #eeffee;
    color: #006600;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .links {
    margin-top: 1rem;
    text-align: center;
  }

  .back {
    display: block;
    text-align: center;
    color: #0066cc;
  }

  a {
    color: #0066cc;
  }
</style>
