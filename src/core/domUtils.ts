/** Nearest ancestor (or self) that scrolls vertically with overflow auto/scroll. */
export function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  let node: HTMLElement | null = el;
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    if (
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      node.scrollHeight > node.clientHeight + 8
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

/**
 * Prefer the scrollable ancestor with the most vertical overflow (scrollHeight − clientHeight)
 * walking from `seed` toward the document root. Safer than `getScrollParent` on Gemini / Claude /
 * Chromium, where nested `overflow:auto` regions can confuse the nearest-scroller heuristic.
 * Skips `document.body` so callers can fall back to `scrollingElement` / `window` scroll.
 */
export function getLargestVerticalScrollAncestor(seed: HTMLElement | null): HTMLElement | null {
  if (!seed) return null;
  let best: HTMLElement | null = null;
  let bestOverflow = -1;
  for (
    let node: HTMLElement | null = seed;
    node && node !== document.documentElement;
    node = node.parentElement
  ) {
    if (node === document.body) continue;
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    if (
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      node.scrollHeight > node.clientHeight + 8
    ) {
      const overflow = node.scrollHeight - node.clientHeight;
      if (overflow > bestOverflow) {
        bestOverflow = overflow;
        best = node;
      }
    }
  }
  return best;
}

export function uniqElements(nodes: HTMLElement[]): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const out: HTMLElement[] = [];
  for (const n of nodes) {
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

/** First-line preview text for timeline / search (platform-agnostic). */
export function extractTurnPreview(root: HTMLElement, maxLen = 140): string {
  const scoped =
    root.querySelector<HTMLElement>(
      '[data-message-content], [data-turn-copy], .markdown, .prose, .whitespace-pre-wrap',
    ) ?? root;
  let t = scoped.innerText?.replace(/\s+/g, ' ').trim() ?? '';
  if (t.length > maxLen) t = `${t.slice(0, maxLen - 1)}…`;
  return t;
}
