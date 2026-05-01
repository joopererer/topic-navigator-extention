/**
 * One platform (ChatGPT, Gemini, …) supplies DOM heuristics for “turn” anchors and scroll roots.
 */
export interface PlatformAdapter {
  readonly id: string;
  matchesLocation(url: URL): boolean;
  /** Roots used as timeline nodes (typically user messages per turn). */
  findTurnRoots(doc: Document): HTMLElement[];
  /** Scrollable ancestor for the conversation; fallback document.scrollingElement. */
  getScrollRoot(doc: Document): HTMLElement | null;
  /** Optional container to observe with MutationObserver; defaults to scroll root or document.body */
  getObserveRoot(doc: Document): Element | null;
}

/** Sync storage key for `<match_patterns>` rows (one per line) for self-hosted Onyx. */
export const STORAGE_CUSTOM_ONYX = 'topicNav_customOnyxPatterns' as const;
