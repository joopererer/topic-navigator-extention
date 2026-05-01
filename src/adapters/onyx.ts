import { getScrollParent, uniqElements } from '../core/domUtils.js';
import type { PlatformAdapter } from '../core/types.js';

function hostnameAllowed(hostname: string, extraHosts: Set<string>): boolean {
  if (hostname === 'cloud.onyx.app') return true;
  return extraHosts.has(hostname);
}

function isLikelyChatPath(loc: string): boolean {
  return loc.includes('/chat') || loc.includes('/search') || /\/c\/[\w-]+/i.test(loc);
}

function findOnyxRoots(doc: Document): HTMLElement[] {
  const selectors = [
    '.chat-message.user',
    '.chat-message[data-role="user"]',
    'div.chat-message.user',
    '[data-message-role="user"]',
    '[class*="HumanMessage"]',
    '[class*="human-message"]',
  ];

  let list: HTMLElement[] = [];
  for (const sel of selectors) {
    const batch = uniqElements([...(doc.querySelectorAll(sel) as NodeListOf<HTMLElement>)]);
    if (batch.length > list.length) list = batch;
  }

  list = uniqElements(list);

  return list.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}

function scrollRootFromDoc(doc: Document): HTMLElement | null {
  const first = findOnyxRoots(doc)[0];
  if (first) {
    const s = getScrollParent(first);
    if (s) return s;
  }
  return (
    (doc.querySelector(
      '[data-overlayscrollbars-viewport],[class*="ChatScroll"], [class*="overflow-y-auto"], main',
    ) as HTMLElement | null) ?? ((doc.scrollingElement as HTMLElement) ?? doc.body)
  );
}

export function createOnyxAdapter(extraHosts: Set<string>): PlatformAdapter {
  return {
    id: 'onyx',

    matchesLocation(url: URL): boolean {
      if (!hostnameAllowed(url.hostname, extraHosts)) return false;
      return isLikelyChatPath(url.pathname + url.hash);
    },

    findTurnRoots(doc: Document): HTMLElement[] {
      return findOnyxRoots(doc);
    },

    getScrollRoot(doc: Document): HTMLElement | null {
      return scrollRootFromDoc(doc);
    },

    getObserveRoot(doc: Document): Element | null {
      const scroll = scrollRootFromDoc(doc);
      return scroll?.parentElement ?? doc.querySelector('main') ?? doc.body;
    },
  };
}
