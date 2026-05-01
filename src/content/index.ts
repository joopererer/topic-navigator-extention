import {
  STORAGE_TOPIC_NAV_APPEARANCE,
  STORAGE_TOPIC_NAV_APPEARANCE_LIVE_PREVIEW,
} from '../core/appearance.js';
import { STORAGE_TOPIC_NAV_UI } from '../core/uiPrefs.js';
import { TopicNavigatorCore } from '../core/TopicNavigatorCore.js';
import { patchSpaNavigation } from '../core/spaRouter.js';
import { STORAGE_CUSTOM_ONYX } from '../core/types.js';
import { loadOnyxHostsFromStorage, pickAdapter } from './pickAdapter.js';

let core: TopicNavigatorCore | null = null;
let hostsCache: Set<string> = new Set();
let routeTimer: number | undefined;

async function readHosts(): Promise<Set<string>> {
  hostsCache = await loadOnyxHostsFromStorage();
  return hostsCache;
}

function destroyCore(): void {
  core?.destroy();
  core = null;
}

async function boot(): Promise<void> {
  destroyCore();
  const url = new URL(location.href);
  const hosts = await readHosts();
  const adapter = pickAdapter(url, hosts);
  if (!adapter) return;
  core = new TopicNavigatorCore(adapter);
  core.start();
}

function scheduleBoot(): void {
  if (routeTimer) clearTimeout(routeTimer);
  destroyCore();
  routeTimer = window.setTimeout(() => {
    void boot();
    routeTimer = undefined;
  }, 450);
}

void boot();

const unPatch = patchSpaNavigation(() => {
  scheduleBoot();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && STORAGE_TOPIC_NAV_APPEARANCE_LIVE_PREVIEW in changes) {
    core?.applyStoredAppearanceOnly();
    return;
  }
  if (area !== 'sync') return;
  if (changes[STORAGE_CUSTOM_ONYX]) scheduleBoot();
  if (changes[STORAGE_TOPIC_NAV_APPEARANCE] || changes[STORAGE_TOPIC_NAV_UI]) core?.refresh();
});

window.addEventListener(
  'beforeunload',
  () => {
    unPatch();
    destroyCore();
  },
  { once: true },
);
