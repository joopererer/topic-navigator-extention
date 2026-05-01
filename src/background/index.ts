import { STORAGE_CUSTOM_ONYX } from '../core/types.js';

const DYNAMIC_ID = 'topic-nav-custom-onyx';

async function getPatterns(): Promise<string[]> {
  const r = await chrome.storage.sync.get(STORAGE_CUSTOM_ONYX);
  const v = r[STORAGE_CUSTOM_ONYX];
  return Array.isArray(v) ? (v as string[]) : [];
}

async function syncDynamicContentScripts(): Promise<void> {
  const patterns = (await getPatterns()).map((p) => p.trim()).filter(Boolean);

  try {
    await chrome.scripting.unregisterContentScripts({ ids: [DYNAMIC_ID] });
  } catch {
    /* not registered */
  }

  if (!patterns.length) return;

  try {
    await chrome.scripting.registerContentScripts([
      {
        id: DYNAMIC_ID,
        matches: patterns,
        js: ['content.js'],
        runAt: 'document_idle',
      },
    ]);
  } catch (e) {
    console.warn('[topic-navigator] registerContentScripts failed:', e);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void syncDynamicContentScripts();
});

chrome.runtime.onStartup.addListener(() => {
  void syncDynamicContentScripts();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[STORAGE_CUSTOM_ONYX]) {
    void syncDynamicContentScripts();
  }
});
