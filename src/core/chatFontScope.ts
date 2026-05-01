import type { PlatformAdapter } from './types.js';

/**
 * First matching selector wins (ordered specific → general).
 * Fallback: conversation scroll root with `id` (Claude/Gemini often use inner scroll panes
 * where generic `main` matches the wrong node or misses the message column).
 */
export function resolveChatFontScopeSelector(doc: Document, adapter: PlatformAdapter): string | null {
  const fn = adapter.getChatFontScopeSelectors;
  if (fn) {
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
  }

  try {
    const sr = adapter.getScrollRoot(doc);
    if (sr instanceof HTMLElement && sr !== doc.body && sr !== doc.documentElement) {
      const id = sr.id?.trim();
      if (id) return `#${CSS.escape(id)}`;
    }
  } catch {
    /* ignore */
  }

  return null;
}
