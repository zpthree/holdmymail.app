<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";

  let frameLoaded = $state(false);

  const mockDigestHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Hold My Mail – Digest Preview</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body,
      #digest-table {
        background-color: #17120c !important;
        color: #fefcf9 !important;
      }

      a {
        color: #fefcf9 !important;
      }

      h1,
      h2 {
        color: #fefcf9 !important;
      }

      .tag,
      .button {
        background-color: #af0621 !important;
      }

      .label {
        color: #bbb !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fefcf9; font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table id="digest-table" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fefcf9; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%;">

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
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">
                Your Daily Hold My Mail Digest
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px 18px;">
              <p class="label" style="margin: 0; font-size: 14px; color: #888;">
                Friday, February 20, 2026 &middot; 4 emails &middot; 2 links
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px;">
              <div style="border-top: 2px solid #000; margin-bottom: 18px;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td class="tag" style="background-color:#000;border-radius:4px;padding:3px 8px;display:flex;justify-content:center;align-items:center;text-align:center;">
                          <span style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">
                            Work
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="padding: 0 0 24px 0;"><p class="label" style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;">GitHub</p><a href="#" style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">Pull request approved: onboarding cleanup</a><p class="label" style="margin: 0; font-size: 12px; color: #888;">Feb 20, 2026, 9:14 AM</p></td></tr>
                <tr><td style="padding: 0 0 24px 0;"><p class="label" style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;">Linear</p><a href="#" style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">Issue assigned: Improve digest loading state</a><p class="label" style="margin: 0; font-size: 12px; color: #888;">Feb 20, 2026, 8:42 AM</p></td></tr>

                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td class="tag" style="background-color:#000;border-radius:4px;padding:3px 8px;display:flex;justify-content:center;align-items:center;text-align:center;">
                          <span style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">
                            Personal
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="padding: 0 0 24px 0;"><p class="label" style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;">Spotify</p><a href="#" style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">Your weekly discovery playlist is ready</a><p class="label" style="margin: 0; font-size: 12px; color: #888;">Feb 19, 2026, 10:03 PM</p></td></tr>
                <tr><td style="padding: 0 0 24px 0;"><p class="label" style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;">Delta</p><a href="#" style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">Trip update: gate changed for your flight</a><p class="label" style="margin: 0; font-size: 12px; color: #888;">Feb 19, 2026, 6:21 PM</p></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px;">
              <div style="border-top: 2px solid #000; margin-bottom: 18px;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px 8px;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #000;">
                Saved Links
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px 18px;">
              <p class="label" style="margin: 0; font-size: 14px; color: #888;">2 links since your last digest</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px 8px;"><a href="#" style="display: block; margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">Designing Better Empty States</a><p class="label" style="margin: 0 0 2px 0; font-size: 12px; color: #666;">Smashing Magazine</p></td>
          </tr>
          <tr>
            <td style="padding: 0 24px 18px;"><a href="#" style="display: block; margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">SvelteKit Routing Patterns</a><p class="label" style="margin: 0 0 2px 0; font-size: 12px; color: #666;">Svelte Blog</p></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  function handlePreviewLoad(e: Event): void {
    frameLoaded = true;
    const iframe = e.currentTarget as HTMLIFrameElement | null;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.body.style.margin = "0";
    doc.documentElement.style.overflow = "hidden";
    iframe.style.height = doc.documentElement.scrollHeight + 1 + "px";

    doc.addEventListener("click", (clickEvent) => {
      clickEvent.preventDefault();
    });
  }
</script>

<SEO
  path="/"
  data={{
    meta_title: "Hold My Mail",
    meta_description:
      "Get one clean digest for newsletters and other non-urgent email",
  }}
/>

<main class="home">
  <header class="hero">
    <h1 style="font-size: var(--fs-xxl);">Your mail, on your schedule.</h1>
    <p>
      Hold My Mail collects newsletters, promotions, and other non-urgent
      emails, then delivers them to your inbox on your schedule.
    </p>
  </header>

  <section class="preview" aria-label="Digest preview">
    <article>
      <div class="body">
        <iframe
          class:loaded={frameLoaded}
          srcdoc={mockDigestHtml}
          sandbox="allow-same-origin"
          title="Example digest preview"
          onload={handlePreviewLoad}
        ></iframe>
      </div>
    </article>
  </section>
</main>

<style>
  .home {
    margin: 0 auto;
    padding: 3rem 2rem;
    max-width: var(--container-width);
  }

  .hero {
    margin: 0 auto 2rem;
    max-width: 40rem;
    text-align: center;
  }

  h1 {
    margin: 0;
    line-height: 1.1;
  }

  p {
    margin: 0.9rem 0 0;
    font-size: var(--fs-base);
  }

  article {
    border-radius: var(--br-lg);
    background: var(--bg-color-2);
    overflow: hidden;
  }

  .body {
    padding: 0;

    iframe {
      display: block;
      opacity: 0;
      transition: opacity 180ms ease;
      border: none;
      width: 100%;
      overflow: hidden;

      &.loaded {
        opacity: 1;
      }
    }
  }
</style>
