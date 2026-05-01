import { chatgptAdapter } from '../adapters/chatgpt.js';
import { claudeAdapter } from '../adapters/claude.js';
import { geminiAdapter } from '../adapters/gemini.js';
import { createOnyxAdapter } from '../adapters/onyx.js';
import { STORAGE_CUSTOM_ONYX, type PlatformAdapter } from '../core/types.js';
import { hostsFromMatchPatterns } from '../util/matchPatterns.js';

const builtIn: PlatformAdapter[] = [chatgptAdapter, geminiAdapter, claudeAdapter];

export function pickAdapter(url: URL, onyxExtraHosts: Set<string>): PlatformAdapter | null {
  const onyx = createOnyxAdapter(onyxExtraHosts);
  const ordered = [...builtIn, onyx];
  for (const a of ordered) {
    if (a.matchesLocation(url)) return a;
  }
  return null;
}

export async function loadOnyxHostsFromStorage(): Promise<Set<string>> {
  const res = await chrome.storage.sync.get(STORAGE_CUSTOM_ONYX);
  const lines = Array.isArray(res[STORAGE_CUSTOM_ONYX])
    ? (res[STORAGE_CUSTOM_ONYX] as string[])
    : [];
  return hostsFromMatchPatterns(lines);
}
