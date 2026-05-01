import { getScrollParent, uniqElements } from '../core/domUtils.js';
import type { PlatformAdapter } from '../core/types.js';

/** DOCUMENT_POSITION_FOLLOWING — avoid global `Node` in Vitest/jsdom. */
const DOC_POS_FOLLOWING = 4;

function sortRoots(els: HTMLElement[]): HTMLElement[] {
  return uniqElements(els).sort((a, b) =>
    a.compareDocumentPosition(b) & DOC_POS_FOLLOWING ? -1 : 1,
  );
}

/**
 * ChatGPT user turns — current UI exposes `data-turn="user"` + `data-turn-id`
 * (see community timeline extensions). Fallbacks retain older `[data-message-author-role]`.
 */
export const chatgptAdapter: PlatformAdapter = {
  id: 'chatgpt',

  matchesLocation(url: URL): boolean {
    const h = url.hostname;
    if (!(h === 'chatgpt.com' || h === 'chat.openai.com')) return false;
    const p = url.pathname;
    if (p === '/' || p === '') return false;
    if (/\/g\/|^\/gpts?\/?$/i.test(p)) return false;
    return p.includes('/c/') || p.includes('/share');
  },

  findTurnRoots(doc: Document): HTMLElement[] {
    const byDataTurnStable = [...doc.querySelectorAll('[data-turn="user"][data-turn-id]')] as HTMLElement[];
    if (byDataTurnStable.length) return sortRoots(byDataTurnStable);

    const byDataTurn = [...doc.querySelectorAll('[data-turn="user"]')] as HTMLElement[];
    if (byDataTurn.length) return sortRoots(byDataTurn);

    const byRoleNodes = [...doc.querySelectorAll('[data-message-author-role="user"]')] as HTMLElement[];
    if (byRoleNodes.length) {
      const roots = uniqElements(
        byRoleNodes.map((el) => (el.closest('article') ?? el) as HTMLElement).filter(Boolean),
      );
      if (roots.length) return sortRoots(roots);
    }

    const byAltRole = [
      ...(doc.querySelectorAll('[data-role="user"], [data-message-author="user"]')),
    ] as HTMLElement[];
    if (byAltRole.length) return sortRoots(byAltRole.map((el) => (el.closest('article') ?? el) as HTMLElement));

    const legacyArticles = uniqElements([
      ...(doc.querySelectorAll('article[data-turn="user"], article.turn-user, .user-turn') as NodeListOf<HTMLElement>),
    ]);
    if (legacyArticles.length) return legacyArticles;

    const turnBuckets = [...doc.querySelectorAll('[data-testid^="conversation-turn-"]')] as HTMLElement[];
    const turnUsers = uniqElements(
      turnBuckets.filter(
        (bucket) =>
          bucket.querySelector(
            '[data-message-author-role="user"], [data-turn="user"], [data-role="user"]',
          ) !== null,
      ),
    );
    if (turnUsers.length) return sortRoots(turnUsers);

    return [];
  },

  getScrollRoot(doc: Document): HTMLElement | null {
    /** Thread scroll often lives inside a nested flex child, not on `<main>`. */
    const seed =
      (doc.querySelector('[data-turn="user"][data-turn-id]') as HTMLElement | null) ??
      (doc.querySelector('[data-turn="user"]') as HTMLElement | null) ??
      (doc.querySelector('[data-message-author-role="user"]') as HTMLElement | null) ??
      (doc.querySelector('main article') as HTMLElement | null);

    const fromBubble = seed ? getScrollParent(seed) : null;
    if (
      fromBubble &&
      fromBubble !== document.documentElement &&
      fromBubble !== document.body &&
      fromBubble.scrollHeight > fromBubble.clientHeight + 8
    ) {
      return fromBubble;
    }

    const main = doc.querySelector('main') as HTMLElement | null;
    if (main && main.scrollHeight > main.clientHeight + 40) return main;
    return (doc.scrollingElement as HTMLElement) ?? null;
  },

  getObserveRoot(doc: Document): Element | null {
    return doc.querySelector('main') ?? doc.body;
  },
};
