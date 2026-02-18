const REDIRECT_PARAM_KEYS = [
  "url",
  "u",
  "redirect",
  "redirect_url",
  "redirectUrl",
  "target",
  "dest",
  "destination",
  "r",
  "redir",
];

const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^mc_(cid|eid)$/i,
  /^mkt_tok$/i,
  /^_hsenc$/i,
  /^_hsmi$/i,
  /^hsCtaTracking$/i,
  /^vero_(conv|id)$/i,
  /^pk_(campaign|kwd|source|medium|content)$/i,
  /^ga_(source|medium|campaign|content|term)$/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^igshid$/i,
  /^rb_clickid$/i,
  /^wickedid$/i,
];

const TRACKING_HOST_PATTERNS = [
  /(^|\.)eventtracking\./i,
  /(^|\.)tracking\./i,
  /(^|\.)trk\./i,
  /(^|\.)mandrillapp\.com$/i,
  /(^|\.)mailtrack\./i,
];

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isTrackingHost(hostname: string): boolean {
  return TRACKING_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function stripTrackingParams(url: URL): URL {
  const next = new URL(url.toString());
  for (const key of [...next.searchParams.keys()]) {
    if (TRACKING_PARAM_PATTERNS.some((pattern) => pattern.test(key))) {
      next.searchParams.delete(key);
    }
  }
  return next;
}

function unwrapRedirect(url: URL): URL {
  for (const key of REDIRECT_PARAM_KEYS) {
    const candidate = url.searchParams.get(key);
    if (!candidate || !isHttpUrl(candidate)) continue;
    try {
      return new URL(candidate);
    } catch {
      continue;
    }
  }
  return url;
}

function isLikelyTrackingUrl(url: URL): boolean {
  if (isTrackingHost(url.hostname)) return true;
  return /\b(track|tracking|open|pixel|click)\b/.test(
    url.pathname.toLowerCase(),
  );
}

export function sanitizeEmailHtml(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc
    .querySelectorAll("script, object, embed")
    .forEach((node) => node.remove());

  doc.querySelectorAll("a[href]").forEach((node) => {
    const href = node.getAttribute("href");
    if (!href) return;

    try {
      let parsed = new URL(href, "https://email.local");
      parsed = unwrapRedirect(parsed);
      parsed = stripTrackingParams(parsed);
      node.setAttribute("href", parsed.toString());
      node.setAttribute("rel", "noopener noreferrer nofollow");
    } catch {
      // leave invalid/relative links as-is
    }
  });

  doc.querySelectorAll("img").forEach((img) => {
    const width = Number(img.getAttribute("width") || "0");
    const height = Number(img.getAttribute("height") || "0");
    const style = (img.getAttribute("style") || "").toLowerCase();
    const hiddenByStyle =
      style.includes("display:none") || style.includes("visibility:hidden");

    if (
      (width > 0 && width <= 1 && height > 0 && height <= 1) ||
      hiddenByStyle
    ) {
      img.remove();
      return;
    }

    const src = img.getAttribute("src");
    if (!src || !isHttpUrl(src)) return;

    try {
      const parsed = new URL(src);
      if (isLikelyTrackingUrl(parsed)) {
        img.remove();
        return;
      }

      img.setAttribute("src", stripTrackingParams(parsed).toString());
    } catch {
      // ignore invalid src values
    }
  });

  doc.querySelectorAll("source[srcset], img[srcset]").forEach((el) => {
    const srcset = el.getAttribute("srcset");
    if (!srcset) return;

    const cleaned = srcset
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((entry) => {
        const [rawUrl, descriptor] = entry.split(/\s+/, 2);
        try {
          const parsed = new URL(rawUrl);
          if (isLikelyTrackingUrl(parsed)) return "";
          const cleanedUrl = stripTrackingParams(parsed).toString();
          return descriptor ? `${cleanedUrl} ${descriptor}` : cleanedUrl;
        } catch {
          return entry;
        }
      })
      .filter(Boolean)
      .join(", ");

    if (cleaned) el.setAttribute("srcset", cleaned);
    else el.removeAttribute("srcset");
  });

  return doc.documentElement.outerHTML;
}
