<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
  path="/terms-and-conditions"
  data={{
    meta_title: "Terms and Conditions",
    meta_description:
      "Terms and conditions for Hold My Mail — our service agreement and user rights.",
  }}
/>

<div class="terms">
  <a href="/" class="back">← Back</a>

  <h1>Terms and Conditions</h1>
  <p class="updated">Last updated: February 15, 2026</p>

  <section>
    <h2>Agreement to Terms</h2>
    <p>
      By accessing and using Hold My Mail ("Service"), you accept and agree to
      be bound by the terms and provision of this agreement. If you do not agree
      to abide by the above, please do not use this service.
    </p>
  </section>

  <section>
    <h2>Use License</h2>
    <p>
      Permission is granted to temporarily download one copy of the materials
      (information or software) on Hold My Mail for personal, non-commercial
      transitory viewing only. This is the grant of a license, not a transfer of
      title, and under this license you may not:
    </p>
    <ul>
      <li>Modify or copy the materials</li>
      <li>
        Use the materials for any commercial purpose or for any public display
      </li>
      <li>
        Attempt to decompile or reverse engineer any software contained on Hold
        My Mail
      </li>
      <li>
        Remove any copyright or other proprietary notations from the materials
      </li>
      <li>
        Transfer the materials to another person or "mirror" the materials on
        any other server
      </li>
      <li>Use the service to send spam or harass others</li>
      <li>
        Attempt to gain unauthorized access to our systems or other users'
        accounts
      </li>
    </ul>
  </section>

  <section>
    <h2>Account Registration</h2>
    <p>
      To use Hold My Mail, you must create an account with an email address. You
      are responsible for maintaining the confidentiality of your account
      credentials and password. You agree to accept responsibility for all
      activities that occur under your account. You must notify us immediately
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
      The materials on Hold My Mail are provided on an 'as is' basis. Hold My
      Mail makes no warranties, expressed or implied, and hereby disclaims and
      negates all other warranties including, without limitation, implied
      warranties or conditions of merchantability, fitness for a particular
      purpose, or non-infringement of intellectual property or other violation
      of rights.
    </p>
  </section>

  <section>
    <h2>Limitations of Liability</h2>
    <p>
      In no event shall Hold My Mail or its suppliers be liable for any damages
      (including, without limitation, damages for loss of data or profit, or due
      to business interruption) arising out of the use or inability to use the
      materials on Hold My Mail, even if Hold My Mail or an authorized
      representative has been notified orally or in writing of the possibility
      of such damage.
    </p>
  </section>

  <section>
    <h2>Accuracy of Materials</h2>
    <p>
      The materials appearing on Hold My Mail could include technical,
      typographical, or photographic errors. Hold My Mail does not warrant that
      any of the materials on its website are accurate, complete, or current.
      Hold My Mail may make changes to the materials contained on its website at
      any time without notice.
    </p>
  </section>

  <section>
    <h2>Links</h2>
    <p>
      Hold My Mail has not reviewed all of the sites linked to its website and
      is not responsible for the contents of any such linked site. The inclusion
      of any link does not imply endorsement by Hold My Mail of the site. Use of
      any such linked website is at the user's own risk.
    </p>
  </section>

  <section>
    <h2>Modifications</h2>
    <p>
      Hold My Mail may revise these terms and conditions for its website at any
      time without notice. By using this website, you are agreeing to be bound
      by the then current version of these terms and conditions.
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
      <li>To attempt unauthorized access to our systems</li>
    </ul>
    <p>
      Violation of this policy may result in immediate termination of your
      account without refund.
    </p>
  </section>

  <section>
    <h2>Termination</h2>
    <p>
      Hold My Mail reserves the right to terminate your account and use of the
      service at any time, for any reason, with or without notice. Upon
      termination, your right to use the service will immediately cease, and all
      data associated with your account will be permanently deleted.
    </p>
  </section>

  <section>
    <h2>Service Availability</h2>
    <p>
      Hold My Mail makes no guarantee regarding the availability or uptime of
      the service. While we strive for high availability, we do not guarantee
      uninterrupted access. We are not liable for any damages resulting from
      service interruptions or data loss.
    </p>
  </section>

  <section>
    <h2>Contact for Legal Inquiries</h2>
    <p>
      If you have any questions about these Terms and Conditions, please contact
      us at <a href="mailto:zach@zachpatrick.com">zach@zachpatrick.com</a>.
    </p>
  </section>
</div>

<style>
  .terms {
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
