<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
  path="/chrome-extension-privacy"
  data={{
    meta_title: "Hold My Link Privacy Policy",
    meta_description:
      "Privacy policy for the Hold My Link Chrome extension — what data we collect and how we handle it.",
  }}
/>

<main>
  <Header />

  <div class="privacy">
    <h1>Hold My Link Privacy Policy</h1>
    <p class="updated">Last updated: February 15, 2026</p>

    <section>
      <h2>Overview</h2>
      <p>
        Hold My Link is a Chrome extension that allows you to quickly save web
        links to your Hold My Mail account. This privacy policy explains what
        data we collect and how we handle it.
      </p>
    </section>

    <section>
      <h2>Data We Collect</h2>

      <h3>Web History</h3>
      <p>
        When you click the Hold My Link extension icon, we capture the URL and
        page title of the current tab. This allows you to save links with
        pre-filled information.
      </p>

      <h3>Authentication Information</h3>
      <p>
        The extension stores your authentication token and user ID in your
        browser's local storage. This keeps you logged in and allows the
        extension to authenticate your requests with the Hold My Mail API.
      </p>

      <h3>User Account Information</h3>
      <p>
        Your Hold My Mail user ID is stored to associate saved links with your
        account. Your email address is managed separately by the Hold My Mail
        website.
      </p>
    </section>

    <section>
      <h2>How We Use Your Data</h2>
      <ul>
        <li>To authenticate you with the Hold My Mail service</li>
        <li>To save links you submit to your Hold My Mail account</li>
        <li>To improve and maintain the extension's functionality</li>
      </ul>
    </section>

    <section>
      <h2>Data Storage</h2>
      <p>
        Your authentication credentials are stored only in your browser's local
        storage. No data is stored on your device outside of local storage. When
        you save a link, it is sent to the Hold My Mail API and stored in the
        Convex database according to the Hold My Mail privacy policy.
      </p>
    </section>

    <section>
      <h2>What We Don't Collect</h2>
      <ul>
        <li>We do not track your browsing history beyond the current tab</li>
        <li>We do not monitor your keystrokes or mouse movements</li>
        <li>We do not access page content or website data</li>
        <li>We do not store your passwords or sensitive data</li>
        <li>We do not use third-party analytics or tracking</li>
        <li>We do not share your data with third parties</li>
      </ul>
    </section>

    <section>
      <h2>Permissions Explained</h2>

      <h3>activeTab</h3>
      <p>
        Allows the extension to access the URL and title of the current tab when
        you click the extension icon.
      </p>

      <h3>tabs</h3>
      <p>
        Allows the extension to query information about the currently active tab
        so we can prefill the link URL and page title.
      </p>

      <h3>storage</h3>
      <p>
        Allows the extension to store your authentication token and user ID in
        local storage to keep you logged in.
      </p>

      <h3>host_permissions (https://api.holdmymail.app/*)</h3>
      <p>
        Allows the extension to communicate with the Hold My Mail API to
        authenticate you and save links to your account.
      </p>
    </section>

    <section>
      <h2>Data Deletion</h2>
      <p>
        When you uninstall the Hold My Link extension, all data stored in your
        browser (authentication tokens and user IDs) is automatically deleted by
        Chrome. Links you've already saved to your Hold My Mail account remain
        available in your account.
      </p>
    </section>

    <section>
      <h2>Security</h2>
      <p>
        All communication between the extension and the Hold My Mail API occurs
        over HTTPS. Your authentication token is securely stored in your
        browser's local storage and is never transmitted to any party except the
        Hold My Mail API.
      </p>
    </section>

    <section>
      <h2>Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. Changes will be
        posted here with an updated "Last updated" date. Continued use of the
        extension constitutes acceptance of the updated policy.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        If you have any questions about this privacy policy or the Hold My Link
        extension, please contact us at
        <a href="mailto:zach@zachpatrick.com">zach@zachpatrick.com</a>.
      </p>
    </section>
  </div>
</main>

<style>
  .privacy {
    margin: 0 auto;
    padding: 7rem 1rem 2rem;
    max-width: var(--container-width);
    line-height: 1.7;
    font-family: var(--font-sans);
  }
  h1 {
    margin: 0 0 0.25rem;
    font-size: var(--fs-xl);
    font-family: var(--font-sans);
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
