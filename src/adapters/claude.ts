import { getScrollParent, uniqElements } from '../core/domUtils.js';
import type { PlatformAdapter } from '../core/types.js';

function findClaudeRoots(doc: Document): HTMLElement[] {
  const selectors: string[] = [
    '[data-testid="user-message"]',
    '[data-testid*="user-turn"]',
    '[data-role="user"]',
    '[data-message-author-role="user"]',
    '.font-user-message',
    '[class*="UserMessage"]',
  ];

  let found: HTMLElement[] = [];
  for (const sel of selectors) {
    try {
      const batch = [...doc.querySelectorAll(sel)] as HTMLElement[];
      if (batch.length > found.length) found = batch;
    } catch {
      continue;
    }
  }

  if (!found.length) {
    found = uniqElements(
      [...(doc.querySelectorAll('fieldset[data-chat-turn="human"], article[class*="human"]') as NodeListOf<HTMLElement>)],
    );
  }

  const rooted = uniqElements(
    found.map((n) => getMessageRootBlock(n)).filter((x): x is HTMLElement => !!x),
  );

  return rooted.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}

function getMessageRootBlock(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el;
  for (let i = 0; i < 12 && node; i++) {
    const role = node.getAttribute('data-role') ?? '';
    const testid = node.getAttribute('data-testid') ?? '';
    if (/user|human/i.test(role) || /user-turn|human/i.test(testid)) return node;
    node = node.parentElement;
    if (
      node &&
      (node.tagName === 'ARTICLE' ||
        /^FIELDSET$/i.test(node.tagName) ||
        /\b(chat-message|conversation-turn)\b/i.test(node.className))
    ) {
      return node;
    }
  }
  return el.closest('article,fieldset,[data-testid="conversation-turn"]') ?? el;
}

export const claudeAdapter: PlatformAdapter = {
  id: 'claude',
  scrollCueTopPaddingPx: 40,

  matchesLocation(url: URL): boolean {
    if (url.hostname !== 'claude.ai') return false;
    const p = url.pathname;
    if (p === '/' || p === '') return false;
    return !/\/(?:login|signup|account|settings)(?:\/|$)/i.test(p);
  },

  findTurnRoots(doc: Document): HTMLElement[] {
    return findClaudeRoots(doc);
  },

  getScrollRoot(doc: Document): HTMLElement | null {
    const r = findClaudeRoots(doc)[0];
    if (r) {
      const s = getScrollParent(r);
      if (s) return s;
    }
    const m = doc.querySelector(
      'main[class*="chat"], div[class*="ChatScroll"], [class*="ChatScrollContainer"]',
    );
    return (m as HTMLElement) ?? ((doc.scrollingElement as HTMLElement) ?? null);
  },

  getObserveRoot(doc: Document): Element | null {
    return doc.querySelector('main') ?? claudeAdapter.getScrollRoot(doc) ?? doc.body;
  },
};
