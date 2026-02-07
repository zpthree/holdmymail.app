/** @file background.js – service worker that watches for auth callback */

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;

  try {
    const url = new URL(changeInfo.url);

    // Look for the token params that the extension-callback page sets
    const token = url.searchParams.get("hmm_token");
    const userId = url.searchParams.get("hmm_user");

    if (token && userId) {
      // Store the auth credentials
      chrome.storage.local.set({ token, userId }, () => {
        // Close the auth tab
        chrome.tabs.remove(tabId).catch(() => {});
      });
    }
  } catch {
    // URL not parseable — ignore
  }
});
