/** @file popup.js – Hold My Link Chrome Extension */

const API_BASE = "https://3000--main--holdmymail--zach.redtail.codes"; // dev – change for prod
const APP_BASE = "https://5173--main--holdmymail--zach.redtail.codes"; // frontend URL

// ── DOM refs ──
const loginView = document.getElementById("login-view");
const saveView = document.getElementById("save-view");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const saveForm = document.getElementById("save-form");
const saveBtn = document.getElementById("save-btn");
const statusBanner = document.getElementById("status-banner");
const linkUrl = document.getElementById("link-url");
const linkTitle = document.getElementById("link-title");
const linkDescription = document.getElementById("link-description");
const linkTags = document.getElementById("link-tags");

// ── State helpers ──

async function getAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token", "userId"], (data) => {
      resolve(data.token ? data : null);
    });
  });
}

async function setAuth(token, userId) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ token, userId }, resolve);
  });
}

async function clearAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["token", "userId"], resolve);
  });
}

// ── View toggling ──

function showLogin() {
  loginView.classList.remove("hidden");
  saveView.classList.add("hidden");
  loginError.textContent = "";
}

function showSave() {
  loginView.classList.add("hidden");
  saveView.classList.remove("hidden");
  hideBanner();
  prefillFromActiveTab();
}

function showBanner(message, type = "success") {
  statusBanner.textContent = message;
  statusBanner.className = `banner ${type}`;
  statusBanner.classList.remove("hidden");
}

function hideBanner() {
  statusBanner.classList.add("hidden");
  statusBanner.className = "banner hidden";
}

// ── Prefill URL & title from the active tab ──

async function prefillFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      linkUrl.value = tab.url || "";
      linkTitle.value = tab.title || "";
    }
  } catch {
    // ignore – permissions issue
  }
  linkDescription.value = "";
  linkTags.value = "";
}

// ── API helpers ──

async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Login via new tab ──

loginBtn.addEventListener("click", () => {
  const authUrl = `${APP_BASE}/auth/extension-callback`;
  chrome.tabs.create({ url: authUrl });
  // The background service worker watches for the token in the URL,
  // stores it, and closes the tab. Next time the popup opens, we'll be logged in.
  window.close();
});

// ── Logout ──

logoutBtn.addEventListener("click", async () => {
  // Only clear extension storage — don't call server logout
  // so the web app session stays intact
  await clearAuth();
  showLogin();
});

// ── Save link ──

saveForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideBanner();
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  const auth = await getAuth();
  if (!auth) {
    showLogin();
    return;
  }

  const tags = linkTags.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await apiPost(
      "/link",
      {
        url: linkUrl.value.trim(),
        title: linkTitle.value.trim() || undefined,
        description: linkDescription.value.trim() || undefined,
        tags: tags.length ? tags : [],
      },
      auth.token,
    );
    showBanner("Link saved ✓");
    // Clear description and tags but keep URL/title for easy editing
    linkDescription.value = "";
    linkTags.value = "";
  } catch (err) {
    if (err.message === "Token expired") {
      await clearAuth();
      showLogin();
      return;
    }
    showBanner(
      err.message || "Failed to save — check your connection",
      "error",
    );
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Link";
  }
});

// ── Init ──

(async () => {
  const auth = await getAuth();
  if (auth) {
    showSave();
  } else {
    showLogin();
  }
})();
