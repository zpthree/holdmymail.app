<script lang="ts">
  import { preloadData, pushState, goto } from "$app/navigation";
  import type { Email } from "$lib/api";
  import Modal from "$lib/components/Modal.svelte";
  import InboxDeclutteringPreview from "./inbox/decluttering-your-inbox/+page.svelte";
  import InboxHoldMyLinkPreview from "./inbox/hold-my-link/+page.svelte";
  import InboxScreenshotsFromTheAppPreview from "./inbox/screenshots-from-the-app/+page.svelte";
  import SEO from "$lib/components/SEO.svelte";

  let uid_open = $state(false);
  let staticPreviewOpen = $state(false);
  type InboxPreviewData = { email: Email | null; from?: string };
  let previewPath = $state<string | null>(null);

  function isInboxPreviewData(value: unknown): value is InboxPreviewData {
    return (
      typeof value === "object" &&
      value !== null &&
      "email" in (value as Record<string, unknown>)
    );
  }

  async function openPreviewEmail(event: MouseEvent, href: string) {
    event.preventDefault();
    previewPath = href;
    if (
      href === "/inbox/decluttering-your-inbox" ||
      href === "/inbox/hold-my-link" ||
      href === "/inbox/screenshots-from-the-app"
    ) {
      pushState(href, {});
      staticPreviewOpen = true;
      uid_open = true;
      return;
    }

    const result = await preloadData(href);
    if (
      result.type === "loaded" &&
      result.status === 200 &&
      isInboxPreviewData(result.data)
    ) {
      pushState(href, { selected: result.data });
      uid_open = true;
    } else {
      goto(href);
    }
  }
</script>

<Modal
  bind:isOpen={uid_open}
  close={() => {
    staticPreviewOpen = false;
    history.back();
  }}
>
  {#if staticPreviewOpen}
    {#if previewPath === "/inbox/decluttering-your-inbox"}
      <div class="shallow">
        <InboxDeclutteringPreview shallow={true} />
      </div>
    {:else if previewPath === "/inbox/hold-my-link"}
      <div class="shallow">
        <InboxHoldMyLinkPreview shallow={true} />
      </div>
    {:else if previewPath === "/inbox/screenshots-from-the-app"}
      <div class="shallow">
        <InboxScreenshotsFromTheAppPreview shallow={true} />
      </div>
    {/if}
  {/if}
</Modal>

<SEO
  path="/"
  data={{
    meta_title: "Hold My Mail",
    meta_description:
      "Get one clean digest for newsletters and other non-urgent email",
  }}
/>

<div class="home">
  <div class="hero">
    <h1 style="font-size: var(--fs-xxl);">Your mail, on your schedule.</h1>
    <p>
      Take control of your inbox by scheduling your newsletters and other
      non-urgent emails to arrive when you're ready to read them.
    </p>
    <a href="/auth/register" class="btn-get-started btn btn-accent"
      >Get started for free</a
    >
    <ul>
      <li>
        <a href="/privacy">Privacy Policy</a>
      </li>
      <li>
        <a href="/terms-and-conditions">Terms and Conditions</a>
      </li>
    </ul>
  </div>

  <section class="preview" aria-label="Digest preview">
    <article>
      <div
        id="digest-container"
        style="margin: 0; padding: 0; background-color: #fefcf9; font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
      >
        <table
          id="digest-table"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="padding: 32px 0;"
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="max-width: 600px; width: 100%;"
                >
                  <tbody>
                    <tr>
                      <td align="center" style="padding: 0 24px 32px;">
                        <img
                          src="https://meedyuh.zachpatrick.com/hold-my-mail-logo.png"
                          alt="Hold My Mail"
                          width="180"
                          style="display: block; width: 150px; height: auto;"
                        />
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 8px;">
                        <h1
                          style="margin: 0; font-size: 28px; font-weight: 700; color: #000;"
                        >
                          Your Daily Hold My Mail Digest
                        </h1>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 18px;">
                        <p
                          class="label"
                          style="margin: 0; font-size: 14px; color: #888;"
                        >
                          Friday, February 20, 2026 &middot; 3 emails &middot; 2
                          links
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <div
                          style="border-top: 2px solid #000; margin-bottom: 18px;"
                        ></div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                        >
                          <tbody>
                            <tr>
                              <td style="padding: 0 0 16px 0;">
                                <table
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="tag"
                                        style="background-color:#000;border-radius:4px;padding:3px 8px;display:flex;justify-content:center;align-items:center;text-align:center;"
                                      >
                                        <span
                                          style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;"
                                        >
                                          Get Started
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr
                              ><td style="padding: 0 0 24px 0;"
                                ><p
                                  class="label"
                                  style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;"
                                >
                                  Hold My Mail
                                </p>
                                <a
                                  href="/inbox/decluttering-your-inbox"
                                  onclick={(event) =>
                                    openPreviewEmail(
                                      event,
                                      "/inbox/decluttering-your-inbox",
                                    )}
                                  style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;"
                                  >Decluttering your inbox</a
                                >
                                <p
                                  class="label"
                                  style="margin: 0; font-size: 12px; color: #888;"
                                >
                                  Feb 20, 2026, 9:14 AM
                                </p></td
                              ></tr
                            >

                            <tr
                              ><td style="padding: 0 0 24px 0;"
                                ><p
                                  class="label"
                                  style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;"
                                >
                                  Hold My Mail
                                </p>
                                <a
                                  href="/inbox/hold-my-link"
                                  onclick={(event) =>
                                    openPreviewEmail(
                                      event,
                                      "/inbox/hold-my-link",
                                    )}
                                  style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;"
                                  >Save links to your account, and read them
                                  later</a
                                >
                                <p
                                  class="label"
                                  style="margin: 0; font-size: 12px; color: #888;"
                                >
                                  Feb 20, 2026, 8:42 AM
                                </p></td
                              ></tr
                            >
                            <tr
                              ><td style="padding: 0 0 24px 0;"
                                ><p
                                  class="label"
                                  style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;"
                                >
                                  Hold My Mail
                                </p>
                                <a
                                  href="/inbox/screenshots-from-the-app"
                                  onclick={(event) =>
                                    openPreviewEmail(
                                      event,
                                      "/inbox/screenshots-from-the-app",
                                    )}
                                  style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;"
                                  >Screenshots from the app</a
                                >
                                <p
                                  class="label"
                                  style="margin: 0; font-size: 12px; color: #888;"
                                >
                                  Feb 20, 2026, 8:42 AM
                                </p></td
                              ></tr
                            >
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <div
                          style="border-top: 2px solid #000; margin-bottom: 18px;"
                        ></div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 8px;">
                        <h2
                          style="margin: 0; font-size: 22px; font-weight: 700; color: #000;"
                        >
                          Saved Links
                        </h2>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 18px;">
                        <p
                          class="label"
                          style="margin: 0; font-size: 14px; color: #888;"
                        >
                          2 links since your last digest
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 8px;"
                        ><a
                          href="https://zachpatrick.com/blog/tips-for-maintaining-inbox-zero"
                          target="_blank"
                          style="display: block; margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;"
                          >Tips for Maintaining Inbox Zero</a
                        >
                        <p
                          class="label"
                          style="margin: 0 0 2px 0; font-size: 12px; color: #666;"
                        >
                          zachpatrick.com
                        </p></td
                      >
                    </tr>
                    <tr>
                      <td style="padding: 0 24px 18px;"
                        ><a
                          href="https://x.com/holdmymail"
                          target="_blank"
                          rel="noopener noreferrer"
                          style="display: block; margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;"
                          >Follow Hold My Mail on X</a
                        >
                        <p
                          class="label"
                          style="margin: 0 0 2px 0; font-size: 12px; color: #666;"
                        >
                          X.com/holdmymail
                        </p></td
                      >
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <!-- CTA -->
            <tr>
              <td style="padding: 8px 24px 24px; text-align: center;">
                <a
                  class="btn btn-accent"
                  href="/auth/register"
                  style="width: 100%;max-width: 200px;margin: 0 auto;"
                >
                  Get started for free
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</div>

<style>
  .home {
    margin: 0 auto;
    padding: 3rem 2rem;
    max-width: var(--container-width);
  }

  .hero {
    margin: 0 auto 2rem;
    max-width: 38rem;
    text-align: center;
  }

  h1 {
    margin: 0;
    line-height: 1.1;
  }

  p {
    margin: 0.9rem 0 0;
    font-size: var(--fs-base);
    line-height: 1.5;
  }

  .hero ul {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0 0;
    padding: 0;
    font-size: var(--fs-xs);
    list-style: none;
    text-decoration: none;

    a {
      color: var(--text-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  article {
    border-radius: var(--br-lg);
    background: var(--bg-color-2);
    overflow: hidden;
  }

  .btn-get-started {
    margin: 1rem auto 0;
    width: 13rem;
  }

  :global(#modal-children > div) {
    position: relative;
    margin: auto;
    width: 100vw;
    max-width: 48rem;
    height: 100%;
    overflow: auto;
    overscroll-behavior-y: contain;
  }

  #digest-container {
    @media (prefers-color-scheme: dark) {
      background-color: #17120c !important;
      color: #fefcf9 !important;

      a {
        color: #fefcf9 !important;
      }

      h1,
      h2 {
        color: #fefcf9 !important;
      }

      .tag {
        background-color: #af0621 !important;
      }

      .label {
        color: #bbb !important;
      }
    }
  }
</style>
