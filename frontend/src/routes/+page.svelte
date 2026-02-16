<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import Logo from "$lib/components/Logo.svelte";
  import SEO from "$lib/components/SEO.svelte";

  // If logged in, skip the landing page
  $effect(() => {
    if (!$auth.loading && $auth.token) {
      goto("/digests");
    }
  });
</script>

<SEO
  path="/"
  data={{
    meta_title: "Hold My Mail",
    meta_description:
      "Take control of your inbox. Hold My Mail batches your emails into scheduled digests so you can focus on what matters.",
  }}
/>

{#if $auth.loading || $auth.token}
  <div class="loading"></div>
{:else}
  <div class="landing">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-logo"><Logo /></div>
        <h1>Your inbox,<br />on your schedule.</h1>
        <p class="subtitle">
          Hold My Mail collects your emails and delivers them as a single
          digest — daily, weekly, or whenever you want. Stop reacting to every
          notification and start reading on your terms.
        </p>
        <div class="hero-cta">
          <a href="/auth/register" class="btn btn-accent">Get Started Free</a>
          <a href="/auth/login" class="btn btn-white">Sign In</a>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <h2>How It Works</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Get your address</h3>
          <p>
            Sign up and get a unique <strong>@inbox.holdmymail.app</strong>
            email address. Use it for newsletters, notifications, and
            confirmations.
          </p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>We hold your mail</h3>
          <p>
            Incoming emails are stored and organized by source. Nothing hits
            your real inbox until you're ready.
          </p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Read on your schedule</h3>
          <p>
            Get a clean digest delivered daily, weekly, or monthly — or browse
            your held emails anytime in the app.
          </p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <h2>Everything you need</h2>
      <div class="feature-grid">
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="28" height="28">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3>Scheduled Digests</h3>
          <p>
            Batch emails into daily, weekly, or monthly digests. Set different
            schedules per source.
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="28" height="28">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h3>Source Management</h3>
          <p>
            See every sender at a glance. Tag, color-code, and set per-source
            delivery preferences.
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="28" height="28">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <h3>Confirmation Alerts</h3>
          <p>
            Time-sensitive confirmation emails surface instantly with a live
            notification badge — never miss a verification link.
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="28" height="28">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </div>
          <h3>Save Links</h3>
          <p>
            Bookmark links from anywhere with the Chrome extension. Open Graph
            previews make your reading list beautiful.
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="28" height="28">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
          </div>
          <h3>Tags & Organization</h3>
          <p>
            Label sources and links with custom tags. Your digests group emails
            by tag automatically.
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="28" height="28">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h3>Privacy First</h3>
          <p>
            No ads, no tracking, no data selling. Your emails are yours. We use
            Fathom Analytics for privacy-friendly stats.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bottom-cta">
      <h2>Take back your attention.</h2>
      <p>Stop drowning in notifications. Start reading on your terms.</p>
      <a href="/auth/register" class="btn btn-accent">Create Your Account</a>
    </section>
  </div>
{/if}

<style>
  .loading {
    min-height: 100vh;
  }

  .landing {
    font-family: var(--font-sans);
  }

  /* ── Hero ── */
  .hero {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6rem 2rem 4rem;
    min-height: 80vh;
    text-align: center;
  }

  .hero-inner {
    max-width: 640px;
  }

  .hero-logo {
    margin-bottom: 2rem;
  }

  .hero-logo :global(svg) {
    width: auto;
    height: 2.5rem;
    color: var(--text-color);
  }

  h1 {
    margin: 0 0 1.25rem;
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: var(--fs-headline);
    line-height: 1.05;
  }

  .subtitle {
    margin: 0 auto 2.5rem;
    max-width: 520px;
    color: var(--text-color);
    font-size: var(--fs-md);
    line-height: 1.5;
    opacity: 0.75;
  }

  .hero-cta {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .hero-cta .btn {
    display: inline-block;
    padding: 0.85rem 2rem;
    font-weight: 600;
    font-size: var(--fs-base);
  }

  /* ── How it Works ── */
  .how-it-works {
    padding: 5rem 2rem;
    text-align: center;
  }

  .how-it-works h2 {
    margin: 0 0 3rem;
    font-family: var(--font-serif);
    font-size: var(--fs-xxl);
  }

  .steps {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    margin: 0 auto;
    max-width: 900px;

    @media screen and (width > 768px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 3rem;
    }
  }

  .step {
    padding: 0 1rem;
  }

  .step-number {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    border-radius: var(--br-circle);
    background: var(--accent);
    width: 2.75rem;
    height: 2.75rem;
    color: var(--white);
    font-weight: 700;
    font-size: var(--fs-md);
  }

  .step h3 {
    margin: 0 0 0.5rem;
    font-size: var(--fs-md);
  }

  .step p {
    margin: 0;
    color: var(--text-color);
    line-height: 1.6;
    opacity: 0.75;
  }

  /* ── Features ── */
  .features {
    padding: 5rem 2rem;
    background: var(--bg-color-2);
  }

  .features h2 {
    margin: 0 0 3rem;
    font-family: var(--font-serif);
    font-size: var(--fs-xxl);
    text-align: center;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin: 0 auto;
    max-width: 900px;

    @media screen and (width > 600px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media screen and (width > 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .feature {
    border: 0.1rem solid oklch(from var(--text-color) 0.2 c h);
    border-radius: var(--br-lg);
    padding: 1.75rem;
  }

  .feature-icon {
    margin-bottom: 0.75rem;
    color: var(--accent);
  }

  .feature h3 {
    margin: 0 0 0.5rem;
    font-size: var(--fs-base);
  }

  .feature p {
    margin: 0;
    color: var(--text-color);
    font-size: var(--fs-sm);
    line-height: 1.6;
    opacity: 0.75;
  }

  /* ── Bottom CTA ── */
  .bottom-cta {
    padding: 5rem 2rem;
    text-align: center;
  }

  .bottom-cta h2 {
    margin: 0 0 0.75rem;
    font-family: var(--font-serif);
    font-size: var(--fs-xxl);
  }

  .bottom-cta p {
    margin: 0 0 2rem;
    color: var(--text-color);
    font-size: var(--fs-md);
    opacity: 0.75;
  }

  .bottom-cta .btn {
    display: inline-block;
    padding: 0.85rem 2.5rem;
    font-weight: 600;
    font-size: var(--fs-base);
  }
</style>
