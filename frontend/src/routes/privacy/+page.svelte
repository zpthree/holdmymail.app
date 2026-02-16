<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
  path="/privacy"
  data={{
    meta_title: "Privacy Policy",
    meta_description:
      "Privacy policy for Hold My Mail — how we collect, use, and protect your data.",
  }}
/>

<div class="privacy">
  <a href="/" class="back">← Back</a>

  <h1>Privacy Policy</h1>
  <p class="updated">Last updated: February 16, 2026</p>

  <section>
    <h2>Introduction</h2>
    <p>
      Hold My Mail ("we", "us", "our") operates the holdmymail.app website and
      related services. This Privacy Policy explains how we collect, use, and
      protect your personal information when you use our service.
    </p>
  </section>

  <section>
    <h2>Information We Collect</h2>

    <h3>Account Information</h3>
    <p>
      When you create an account, we collect your email address, username, and
      password. Your password is securely encrypted and is never stored in plain
      text.
    </p>

    <h3>Email Data</h3>
    <p>
      When emails are sent to your @inbox.holdmymail.app address, we receive and
      store the full email content including sender information, subject,
      message body, and any metadata. This is the core functionality of the
      service — holding your emails until you're ready to view them.
    </p>

    <h3>Saved Links</h3>
    <p>
      When you save links via the website or Chrome extension, we store the URL,
      page title, description, and publicly available Open Graph metadata
      (images, site name) fetched from the linked page.
    </p>

    <h3>Usage Data</h3>
    <p>
      We collect analytics data about your interactions with our website using
      <a href="https://usefathom.com" target="_blank" rel="noopener noreferrer"
        >Fathom Analytics</a
      >. Fathom collects information such as pages visited, time spent, and
      referral source — but does not track personal information, use cookies, or
      share data with third parties. See
      <a
        href="https://usefathom.com/privacy"
        target="_blank"
        rel="noopener noreferrer">Fathom's privacy policy</a
      >
      for details.
  </section>

  <section>
    <h2>How We Use Your Information</h2>
    <ul>
      <li>To provide and maintain the Hold My Mail service</li>
      <li>
        To receive, store, and deliver your emails on your preferred schedule
      </li>
      <li>To generate and send digest emails to your delivery address</li>
      <li>To save and organize your bookmarked links</li>
      <li>To authenticate your account and keep it secure</li>
    </ul>
  </section>

  <section>
    <h2>Data Storage</h2>
    <p>
      Your data is stored securely using <a
        href="https://convex.dev"
        target="_blank"
        rel="noopener noreferrer">Convex</a
      >, a cloud database platform. Email delivery is handled through
      <a
        href="https://postmarkapp.com"
        target="_blank"
        rel="noopener noreferrer">Postmark</a
      >. We do not sell, rent, or share your personal data with any third
      parties for marketing purposes.
    </p>
  </section>

  <section>
    <h2>Authentication &amp; Security</h2>
    <p>
      We use token-based authentication. Your session token is stored in your
      browser's local storage and expires after 30 days. All API communication
      occurs over HTTPS.
    </p>
  </section>

  <section>
    <h2>Data Retention</h2>
    <p>
      Your emails, links, and account data are retained for as long as your
      account is active. When you delete an email, link, or sender, the data is
      permanently removed. If you delete your account, all associated data is
      permanently deleted.
    </p>
  </section>

  <section>
    <h2>Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access all data associated with your account</li>
      <li>Delete individual emails, links, or senders at any time</li>
      <li>Delete your entire account and all associated data</li>
      <li>Export your data by viewing it through the app or API</li>
      <li>Update your email address, password, and delivery preferences</li>
    </ul>
  </section>

  <section>
    <h2>Cookies</h2>
    <p>
      Hold My Mail does not use cookies. Authentication tokens are stored in
      your browser's local storage.
    </p>
  </section>

  <section>
    <h2>Third-Party Services</h2>
    <p>We use the following third-party services to operate Hold My Mail:</p>
    <ul>
      <li>
        <strong>Fathom Analytics</strong> — privacy-friendly website analytics
      </li>
      <li>
        <strong>Convex</strong> — database and backend infrastructure
      </li>
      <li>
        <strong>Postmark</strong> — inbound email receiving and outbound digest delivery
      </li>
      <li>
        <strong>Vercel</strong> — frontend hosting
      </li>
    </ul>
    <p>
      Each of these services has their own privacy policies governing how they
      handle data.
    </p>
  </section>

  <section>
    <h2>Children's Privacy</h2>
    <p>
      Hold My Mail is not intended for use by children under the age of 13. We
      do not knowingly collect personal information from children.
    </p>
  </section>

  <section>
    <h2>Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. We will notify users
      of any material changes by posting the updated policy on this page with a
      revised "Last updated" date.
    </p>
  </section>

  <section>
    <h2>Contact</h2>
    <p>
      If you have any questions about this Privacy Policy, please contact us at
      <a href="mailto:zach@zachpatrick.com">zach@zachpatrick.com</a>.
    </p>
  </section>
</div>

<style>
  .privacy {
    margin: 0 auto;
    padding: 2rem 1rem;
    max-width: var(--container-width);
    line-height: 1.7;
    font-family: var(--font-sans);
  }

  .back {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: var(--text-color);
    font-weight: 500;
    font-size: var(--fs-sm);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  h1 {
    margin: 0 0 0.25rem;
    font-size: var(--fs-xl);
  }

  .updated {
    margin: 0 0 2rem;
    color: var(--text-color);
    font-size: var(--fs-sm);
  }

  section {
    margin-bottom: 2rem;
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: var(--fs-md);
  }

  h3 {
    margin: 1rem 0 0.25rem;
    font-size: var(--fs-base);
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--text-color);
  }

  ul {
    margin: 0 0 0.75rem;
    padding-left: 1.25rem;
    color: var(--text-color);
  }

  li {
    margin-bottom: 0.35rem;
  }

  a {
    color: var(--text-color);
    font-weight: 500;
  }
</style>
