<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import Header from "$lib/components/Header.svelte";
</script>

<SEO
  path="/terms-and-conditions"
  data={{
    meta_title: "Terms and Conditions",
    meta_description:
      "Terms and conditions for Hold My Mail — the agreement between you and me.",
  }}
/>

<main>
  <Header />

  <div class="terms">
    <h1>Terms and Conditions</h1>
    <p class="updated">Last updated: August 20, 2026</p>

    <section>
      <h2>Agreement to Terms</h2>
      <p>
        Hold My Mail is my personal project. I am Zach Patrick, one person, not
        a company. By accessing and using Hold My Mail ("Service"), you accept
        and agree to be bound by these terms. If you do not agree, please do not
        use this service.
      </p>
    </section>

    <section>
      <h2>Using the Service</h2>
      <p>
        I grant you a personal, limited, non-transferable permission to use Hold
        My Mail through holdmymail.app for your own non-commercial use. This is
        a hosted service, not software I am distributing for you to download or
        copy. You may not:
      </p>
      <ul>
        <li>Copy, modify, or redistribute the service</li>
        <li>
          Use the service for any commercial purpose or for any public display
        </li>
        <li>
          Attempt to decompile, reverse engineer, or otherwise extract the
          software that runs Hold My Mail
        </li>
        <li>Use the service to send spam or harass others</li>
        <li>
          Attempt to gain unauthorized access to my systems or other users'
          accounts
        </li>
      </ul>
    </section>

    <section>
      <h2>Account Registration</h2>
      <p>
        To use Hold My Mail, you must create an account with an email address.
        You are responsible for maintaining the confidentiality of your account
        credentials and password. You agree to accept responsibility for all
        activities that occur under your account. You must notify me immediately
        of any unauthorized use of your account.
      </p>
    </section>

    <section>
      <h2>Email Address Usage</h2>
      <p>
        Your Hold My Mail email address (@inbox.holdmymail.app) is for your
        personal use only. You agree not to:
      </p>
      <ul>
        <li>Share your email address with others for malicious purposes</li>
        <li>Use it for illegal activities or to violate laws</li>
        <li>Use it to send spam or unsolicited communications</li>
        <li>Use it in violation of any third-party rights</li>
      </ul>
    </section>

    <section>
      <h2>Disclaimer of Warranties</h2>
      <p>
        Hold My Mail is provided on an "as is" basis. I make no warranties,
        expressed or implied, and I disclaim all other warranties including,
        without limitation, implied warranties or conditions of merchantability,
        fitness for a particular purpose, or non-infringement of intellectual
        property or other violation of rights.
      </p>
    </section>

    <section>
      <h2>Limitations of Liability</h2>
      <p>
        In no event shall I be liable for any damages (including, without
        limitation, damages for loss of data or profit, or due to business
        interruption) arising out of the use or inability to use Hold My Mail,
        even if I have been notified orally or in writing of the possibility of
        such damage.
      </p>
    </section>

    <section>
      <h2>Accuracy of Materials</h2>
      <p>
        The site may include technical, typographical, or other errors. I do
        not warrant that anything on holdmymail.app is accurate, complete, or
        current. I may change the site at any time without notice.
      </p>
    </section>

    <section>
      <h2>Links</h2>
      <p>
        I have not reviewed every site linked from Hold My Mail and I am not
        responsible for the contents of any such linked site. A link is not an
        endorsement. Use of any linked website is at your own risk.
      </p>
    </section>

    <section>
      <h2>Modifications</h2>
      <p>
        I may revise these terms at any time without notice. By using this
        website, you agree to be bound by the then-current version of these
        terms.
      </p>
    </section>

    <section>
      <h2>Governing Law</h2>
      <p>
        These terms and conditions are governed by and construed in accordance
        with the laws of the United States, and you irrevocably submit to the
        exclusive jurisdiction of the courts in that location.
      </p>
    </section>

    <section>
      <h2>Acceptable Use Policy</h2>
      <p>You agree not to use Hold My Mail:</p>
      <ul>
        <li>To harass, threaten, or abuse others</li>
        <li>To send unsolicited email or spam</li>
        <li>To engage in any illegal activity</li>
        <li>To violate the rights of any person or entity</li>
        <li>
          To interfere with the operation of the website or other users' access
        </li>
        <li>To upload viruses or malicious code</li>
        <li>To attempt unauthorized access to my systems</li>
      </ul>
      <p>
        Violation of this policy may result in immediate termination of your
        account without refund.
      </p>
    </section>

    <section>
      <h2>Termination</h2>
      <p>
        I reserve the right to terminate your account and use of the service at
        any time, for any reason, with or without notice. Upon termination, your
        right to use the service will immediately cease, and all data associated
        with your account will be permanently deleted.
      </p>
    </section>

    <section>
      <h2>Service Availability</h2>
      <p>
        Hold My Mail is my personal, self-hosted project, provided as a
        convenience, not a commercial service. There is no uptime guarantee,
        service-level agreement, or promise of uninterrupted access. The service
        may be slow, interrupted, changed, or taken offline at any time —
        including for maintenance, hardware issues, power or network outages, or
        because I am unavailable.
      </p>
      <p>
        I am not liable for any damages resulting from downtime, delayed email
        delivery, or data loss. You should not rely on Hold My Mail as your only
        copy of important mail.
      </p>
    </section>

    <section>
      <h2>Contact for Legal Inquiries</h2>
      <p>
        If you have any questions about these Terms and Conditions, please
        contact me at <a href="mailto:zach@zachpatrick.com"
          >zach@zachpatrick.com</a
        >.
      </p>
    </section>
  </div>
</main>

<style>
  .terms {
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
