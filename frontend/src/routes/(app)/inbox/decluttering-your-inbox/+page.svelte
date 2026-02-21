<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import headshot from "$lib/images/zachpatrick-headshot.png";
  let { shallow = false }: { shallow?: boolean } = $props();
</script>

<SEO
  path="/inbox/decluttering-your-inbox"
  data={{
    meta_title: "Decluttering your inbox",
    meta_description:
      "A quick guide to reducing inbox clutter with Hold My Mail.",
  }}
/>

<div class="email-container">
  <nav>
    {#if !shallow}
      <a href="/inbox" class="back">← Back to Inbox</a>
    {/if}
  </nav>

  <header>
    <h1 style="font-size: var(--fs-xl)">Decluttering your inbox</h1>
  </header>

  <div class="email-view">
    <article>
      <header>
        <div class="meta">
          <div class="from">
            <strong>From:</strong>
            <a href={`/`}>Hold My Mail</a>
          </div>
          <div class="to">
            <strong>To:</strong>
            You
          </div>
          <div class="date">
            <strong>Date:</strong>
            Feb 20, 2026, 9:14 AM
          </div>
        </div>
      </header>

      <div class="body">
        <figure style="margin: 1rem 0;">
          <img
            src="https://meedyuh.zachpatrick.com/messy-desk.webp"
            width="100%"
            height="auto"
            alt="Decluttering your inbox"
          />
        </figure>

        <p>Hey there!</p>

        <p>
          I built Hold My Mail because I was tired of my inbox constantly being
          cluttered with newsletters and promotions that I didn't have time to
          read.
        </p>

        <p>
          I like being able to check my inbox and only seeing mail that needs my
          immediate attention. And newsletters never come when I'm ready to read
          them, so I usually end up archiving them and forgetting about them.
        </p>

        <p>
          Hold My Mail is a tool that solves this problem by collecting
          newsletters, promotions, and other non-urgent emails and delivering
          them to my inbox on <strong>my schedule</strong>.
        </p>

        <p>
          So instead of several newsletters throughout the week, I set things up
          to receive one digest every week!
        </p>

        <p>
          If you're interested in trying it out, you can get started for free by
          clicking the button below.
        </p>
        <div class="cta">
          <a href="/auth/register" class="btn-get-started btn btn-accent"
            >Get started for free</a
          >
        </div>
        <p>---</p>

        <div class="author">
          <img
            class="headshot"
            src={headshot}
            alt="Zach Patrick"
            width="32"
            height="32"
          />
          <div>
            <p style="margin-bottom: -0.25rem;font-weight: 500;">
              Zach Patrick
            </p>
            <p style="font-size: var(--fs-xs);">
              Building things on the internet
            </p>
          </div>
        </div>
      </div>
    </article>
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

  article {
    border-radius: var(--br-lg);
    background: var(--bg-color-2);
    overflow: hidden;
  }

  article header {
    background-color: var(--text-color);
    padding: 1.5rem;
  }

  h1 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .meta {
    color: var(--bg-color);
    font-size: var(--fs-sm);
    line-height: 1.6;
  }

  .meta strong {
    display: inline-block;
    width: 3rem;
    color: var(--bg-color);
    font-weight: 500;
  }

  .meta .from a {
    color: var(--bg-color) !important;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .body {
    margin: auto;
    padding: 1.25rem;
    max-width: 600px;
  }

  .body p {
    margin: 0 0 1rem;
    line-height: 1.6;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .headshot {
      border-radius: var(--br-circle);
      width: 40px;
      height: 40px;
      object-fit: cover;
    }

    p {
      margin: 0;
    }
  }

  .cta {
    margin-block: 1.5rem;
  }
</style>
