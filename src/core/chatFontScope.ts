import type { PlatformAdapter } from './types.js';

/**
 * First matching selector wins (ordered specific → general).
 * Returns a single selector string safe for `querySelector` / CSS rule.
 */
export function resolveChatFontScopeSelector(doc: Document, adapter: PlatformAdapter): string | null {
  const fn = adapter.getChatFontScopeSelectors;
  if (!fn) return null;
  const candidates = fn(doc);
  for (const sel of candidates) {
    try {
      if (typeof sel !== 'string' || !sel.trim()) continue;
      const q = sel.trim();
      if (doc.querySelector(q)) return q;
    } catch {
      /* invalid selector */
    }
  }
  return null;
}
