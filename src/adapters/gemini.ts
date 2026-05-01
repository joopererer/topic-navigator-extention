import { getScrollParent, uniqElements } from '../core/domUtils.js';
import type { PlatformAdapter } from '../core/types.js';

/** Gemini / AI Studio conversation paths (SPA). */
export function isGeminiConversation(url: URL): boolean {
  if (
    !(url.hostname === 'gemini.google.com' || url.hostname === 'business.gemini.google')
  )
    return false;
  const p = url.pathname + url.search;
  return /^\/(?:u\/\d+\/)?(app|gem)(\/|$)/.test(p);
}

function isAiStudioConversation(url: URL): boolean {
  if (!(url.hostname === 'aistudio.google.com' || url.hostname === 'aistudio.google.cn')) return false;
  const p = url.pathname;
  return (
    p.includes('/prompt') || p.includes('/chat') || p.includes('/conversation') || p.includes('/studio')
  );
}

function geminiFindTurnRoots(doc: Document): HTMLElement[] {
  const selectors = [
    '.user-query',
    '[message-content-type="user"]',
    '[data-history-item-type="user"]',
    '[data-history-item-type="User"]',
    '.user-query-bubble-row',
    'bard-message-content-container.user-query-container',
    '.query-content',
    'div[class*="user-query"]',
  ];

  let nodes: HTMLElement[] = [];
  for (const sel of selectors) {
    const found = [...doc.querySelectorAll(sel)] as HTMLElement[];
    if (found.length > nodes.length) nodes = found;
  }

  nodes = uniqElements(nodes);
  nodes = nodes
    .map((n) => {
      let el: HTMLElement | null = n;
      for (let i = 0; i < 5 && el; i++) {
        if (getScrollParent(el)) return el;
        el = el.parentElement;
      }
      return n;
    })
    .filter(Boolean);

  return uniqElements(nodes).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}

export const geminiAdapter: PlatformAdapter = {
  id: 'gemini',

  matchesLocation(url: URL): boolean {
    return isGeminiConversation(url) || isAiStudioConversation(url);
  },

  findTurnRoots(doc: Document): HTMLElement[] {
    return geminiFindTurnRoots(doc);
  },

  getScrollRoot(doc: Document): HTMLElement | null {
    const probe = geminiFindTurnRoots(doc)[0];
    const fromMes = probe ? getScrollParent(probe) : null;
    if (fromMes) return fromMes;
    const main = doc.querySelector(
      'main.chat-main, main[class*="conversation"], main',
    ) as HTMLElement | null;
    return main ?? ((doc.scrollingElement as HTMLElement) ?? doc.body);
  },

  getObserveRoot(doc: Document): Element | null {
    const root =
      geminiAdapter.getScrollRoot(doc)?.parentElement ??
      doc.querySelector('main') ??
      doc.body;
    return root;
  },
};
