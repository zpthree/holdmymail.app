interface DigestEmail {
  _id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  date: string;
  tags: string[];
}

function renderEmailRow(email: DigestEmail): string {
  const dateStr = formatEmailDate(email.date);
  return `
      <tr>
        <td style="padding: 0 0 24px 0;">
          <p style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #444;">
            ${escapeHtml(email.fromName || email.fromEmail)}
          </p>
          <a href="${process.env.FRONTEND_URL}/inbox/${email._id}" style="display: block; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000; line-height: 1.3; text-decoration: none;">
            ${escapeHtml(email.subject)}
          </a>
          ${dateStr ? `<p style="margin: 0; font-size: 12px; color: #888;">${escapeHtml(dateStr)}</p>` : ""}
        </td>
      </tr>`;
}

function renderTagBadge(tag: string): string {
  return `
      <tr>
        <td style="padding: 0 0 16px 0;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="background-color:#000;border-radius:4px;padding:3px 8px;text-align:center;">
                <span style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(tag)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
}

function buildEmailRows(emails: DigestEmail[]): string {
  // Group by primary tag
  const tagged = new Map<string, DigestEmail[]>();
  const untagged: DigestEmail[] = [];

  for (const email of emails) {
    if (email.tags.length === 0) {
      untagged.push(email);
    } else {
      const primary = email.tags[0];
      if (!tagged.has(primary)) tagged.set(primary, []);
      tagged.get(primary)!.push(email);
    }
  }

  // If no tags at all, just list emails
  if (tagged.size === 0) {
    return emails.map((e) => renderEmailRow(e)).join("");
  }

  let rows = "";

  for (const [tag, tagEmails] of tagged) {
    rows += renderTagBadge(tag);
    rows += tagEmails.map((e) => renderEmailRow(e)).join("");
  }

  if (untagged.length > 0) {
    rows += renderTagBadge("Other");
    rows += untagged.map((e) => renderEmailRow(e)).join("");
  }

  return rows;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildDigestHtml(
  emails: DigestEmail[],
  date: Date,
  frequency?: string,
): string {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const freqLabel =
    frequency && frequency !== "none" ? `${capitalizeFirst(frequency)} ` : "";
  const emailRows = buildEmailRows(emails);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Hold My Mail – Digest for ${escapeHtml(formattedDate)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fff; font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fff; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 24px 32px;">
              <a href="${process.env.FRONTEND_URL}">
                <img
                  src="https://meedyuh.zachpatrick.com/hold-my-mail-logo.png"
                  alt="Hold My Mail"
                  width="180"
                  style="display: block; width: 150px; height: auto;"
                />
              </a>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 0 24px 8px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000;">
                Your ${freqLabel}Hold My Mail Digest
              </h1>
            </td>
          </tr>

          <!-- Date + count -->
          <tr>
            <td style="padding: 0 24px 18px;">
              <p style="margin: 0; font-size: 14px; color: #888;">
                ${escapeHtml(formattedDate)} &middot; ${emails.length} email${emails.length === 1 ? "" : "s"}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="border-top: 2px solid #000; margin-bottom: 18px;"></div>
            </td>
          </tr>

          <!-- Email list -->
          <tr>
            <td style="padding: 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${emailRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 8px 24px 0; text-align: center;">
              <a
                href="${process.env.FRONTEND_URL}/inbox"
                style="display: inline-block; background-color: #000; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;"
              >
                View in Inbox →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #bbb;">
                You're receiving this because you have scheduled email delivery on
                <a href="https://holdmymail.app" style="color: #bbb;">Hold My Mail</a>.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px;">
                <a href="${process.env.FRONTEND_URL}/sources" style="color: #bbb;">Manage delivery preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEmailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
