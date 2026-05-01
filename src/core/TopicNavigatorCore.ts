import {
  STORAGE_TOPIC_NAV_APPEARANCE,
  buildTopicNavAppearanceStyle,
  parseTopicNavAppearance,
  type TopicNavAppearanceStored,
} from './appearance.js';
import { extractTurnPreview, getScrollParent } from './domUtils.js';
import {
  STORAGE_TOPIC_NAV_UI,
  defaultUiPrefs,
  parseTopicNavUiStored,
  resolveUiLang,
  type UiLangCode,
} from './uiPrefs.js';
import { t as uiTxt, type UiStringKey } from './uiStrings.js';
import type { PlatformAdapter } from './types.js';

const BAR_ID = 'topic-navigator-bar';
const HOST_STYLE_ID = 'topic-navigator-host-styles';
const USER_APPEARANCE_STYLE_ID = 'topic-navigator-appearance-styles';

/** Inline HTML attribute escapes for localized search field */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Minimum spacing between dot centers — scrollable rail grows when exceeded. */
const MIN_DOT_SPACING_PX = 15;
const STAGE_VERTICAL_PAD_PX = 10;
/** Default padding below scroll-container top when jumping to a cue (hosts may override). */
const SCROLL_ABOVE_CUE_PX_DEFAULT = 88;

const HOST_STYLES = `
#${BAR_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 13px;

  --tn-shell-width: 20px;
  --tn-stage-bg: color-mix(in srgb, Canvas 88%, CanvasText 10%);
  --tn-stage-border: color-mix(in srgb, CanvasText 14%, transparent);
  --tn-dot-size: 10px;
  --tn-dot-idle-bg: color-mix(in srgb, Canvas 55%, CanvasText 10%);
  --tn-dot-idle-border: color-mix(in srgb, CanvasText 32%, transparent);
  --tn-dot-idle-border-w: 1.5px;
  --tn-dot-active-bg: #2563eb;
  --tn-dot-active-border: color-mix(in srgb, #2563eb 55%, CanvasText);
  --tn-dot-active-border-w: 2px;
}
#${BAR_ID} * {
  box-sizing: border-box;
}

/* FAB list button — floated beside the timeline (Voyager-style). */
#${BAR_ID} .topic-nav-fab {
  position: fixed;
  right: 46px;
  top: clamp(104px, 38vh, 46vh);
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, CanvasText 18%, transparent);
  background: color-mix(in srgb, Canvas 90%, CanvasText 10%);
  color: CanvasText;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 22px rgba(0,0,0,0.16);
  pointer-events: auto;
  z-index: 2147483002;
}
#${BAR_ID} .topic-nav-fab:hover {
  background: color-mix(in srgb, Canvas 78%, CanvasText 18%);
}

/* Full-screen overlay layer for outline panel */
#${BAR_ID} .topic-nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483005;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 48px clamp(48px, 6vw, 96px);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity .18s ease, visibility .18s ease;
}
#${BAR_ID} .topic-nav-overlay.topic-nav-overlay--open {
  pointer-events: auto;
  opacity: 1;
  visibility: visible;
}
#${BAR_ID} .topic-nav-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(1px);
}
#${BAR_ID} .topic-nav-sheet {
  position: relative;
  z-index: 1;
  pointer-events: auto;
  margin-right: 2px;
  max-height: min(640px, 88vh);
  width: min(380px, calc(100vw - 96px));
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, CanvasText 14%, transparent);
  background: color-mix(in srgb, Canvas 94%, CanvasText 8%);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
}

#${BAR_ID} .topic-nav-stage-shell {
  position: fixed;
  top: 88px;
  bottom: 40px;
  right: 18px;
  width: var(--tn-shell-width);
  z-index: 2147483001;
  pointer-events: auto;
  display: flex;
  align-items: stretch;
}

#${BAR_ID} .topic-nav-stage {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 120px;
  border-radius: 999px;
  background: var(--tn-stage-bg);
  border: 1px solid var(--tn-stage-border);
  box-shadow: 0 6px 24px rgba(0,0,0,0.15);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}
#${BAR_ID} .topic-nav-stage-inner {
  position: relative;
  width: 100%;
  min-height: 100%;
}
#${BAR_ID} .topic-nav-marker-slot {
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
}
#${BAR_ID} .topic-nav-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--tn-dot-size);
  height: var(--tn-dot-size);
  padding: 0;
  border-radius: 999px;
  border-style: solid;
  border-width: var(--tn-dot-idle-border-w);
  border-color: var(--tn-dot-idle-border);
  background: var(--tn-dot-idle-bg);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    transform 0.12s ease,
    background 0.12s ease,
    border-color 0.12s ease,
    border-width 0.12s ease;
}
#${BAR_ID}[data-tn-dot-style="hollow"] .topic-nav-dot:not(.topic-nav-dot--active),
#${BAR_ID}[data-tn-dot-style="outline"] .topic-nav-dot:not(.topic-nav-dot--active) {
  background: transparent !important;
}
#${BAR_ID}[data-tn-dot-style="hollow"] .topic-nav-dot.topic-nav-dot--active,
#${BAR_ID}[data-tn-dot-style="outline"] .topic-nav-dot.topic-nav-dot--active {
  background: transparent !important;
}
#${BAR_ID} .topic-nav-dot:hover {
  transform: translate(-50%, -50%) scale(1.2);
}
#${BAR_ID} .topic-nav-dot.topic-nav-dot--active {
  border-width: var(--tn-dot-active-border-w);
  border-color: var(--tn-dot-active-border);
  background: var(--tn-dot-active-bg);
  transform: translate(-50%, -50%) scale(1.3);
}

#${BAR_ID} .topic-nav-panel-head {
  padding: 12px 12px 10px;
  border-bottom: 1px solid color-mix(in srgb, CanvasText 10%, transparent);
}
#${BAR_ID} .topic-nav-search {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, CanvasText 16%, transparent);
  background: Canvas;
  color: CanvasText;
  font: inherit;
  outline: none;
}
#${BAR_ID} .topic-nav-search:focus {
  border-color: color-mix(in srgb, #2563eb 55%, CanvasText);
}
#${BAR_ID} .topic-nav-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 4px 10px;
  min-height: 0;
}
#${BAR_ID} .topic-nav-summary-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 7px 8px;
  margin: 2px 6px;
  border-radius: 8px;
  cursor: pointer;
  color: CanvasText;
  border: 1px solid transparent;
  width: calc(100% - 12px);
  text-align: left;
  background: transparent;
  font: inherit;
}
#${BAR_ID} .topic-nav-summary-row:hover {
  background: color-mix(in srgb, CanvasText 6%, transparent);
}
#${BAR_ID} .topic-nav-summary-row.topic-nav-summary-row--active {
  background: color-mix(in srgb, #2563eb 14%, transparent);
  border-color: color-mix(in srgb, #2563eb 35%, transparent);
}
#${BAR_ID} .topic-nav-summary-idx {
  flex-shrink: 0;
  width: 22px;
  text-align: right;
  font-weight: 700;
  font-size: 11px;
  opacity: 0.55;
  padding-top: 1px;
}
#${BAR_ID} .topic-nav-summary-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hover tooltip follows capsule track (--tn-stage-*) filled from theme / popup overrides */
#${BAR_ID} .topic-nav-tooltip-float {
  position: fixed;
  z-index: 2147483640;
  max-width: min(320px, calc(100vw - 24px));
  padding: 8px 11px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 1.38;
  font-weight: 500;
  color: CanvasText;
  background: var(--tn-stage-bg);
  border: 1px solid var(--tn-stage-border);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.26);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.1s ease, visibility 0.1s ease;
  word-break: break-word;
  white-space: pre-wrap;
}
#${BAR_ID} .topic-nav-tooltip-float.topic-nav-tooltip-float--visible {
  opacity: 1;
  visibility: visible;
}
@media (prefers-color-scheme: dark) {
  #${BAR_ID} {
    --tn-dot-active-bg: #60a5fa;
    --tn-dot-active-border: color-mix(in srgb, #60a5fa 55%, CanvasText);
  }
  #${BAR_ID} .topic-nav-summary-row.topic-nav-summary-row--active {
    background: color-mix(in srgb, #60a5fa 16%, transparent);
    border-color: color-mix(in srgb, #60a5fa 40%, transparent);
  }
}
`;

export class TopicNavigatorCore {
  private adapter: PlatformAdapter;
  private uiLang: UiLangCode = 'en';
  private bar: HTMLElement | null = null;
  private dots: HTMLElement[] = [];
  private roots: HTMLElement[] = [];
  private previewStrings: string[] = [];
  private intersectionObserver: IntersectionObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private debounceTimer: number | undefined;
  private onKeyDownBound: ((e: KeyboardEvent) => void) | null = null;
  private activeIndex = -1;

  private panelList: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private overlayEl: HTMLElement | null = null;
  private floatingTip: HTMLElement | null = null;
  private tooltipHideTimer: number | undefined;

  /** Debounced retries so lazy-rendered chats still pick the correct scroll anchor. */
  private viewportSyncTimers: number[] = [];

  private lastSyncScrollRoot: HTMLElement | Document | null = null;

  /** Removes scroll listeners tied to AbortController.abort() */
  private conversationScrollCtl: AbortController | null = null;

  /** Outline panel overlay */
  private isPanelOpen = false;
  private fabButton: HTMLButtonElement | null = null;
  private stageEl: HTMLElement | null = null;
  private stageInner: HTMLElement | null = null;

  /** Hide floating tooltip when the user scrolls or zooms the page (Voyager-style). */
  private readonly onWheelHideTip = (): void => {
    this.hideTooltip(true);
  };

  constructor(adapter: PlatformAdapter) {
    this.adapter = adapter;
  }

  private ux(key: UiStringKey, vars?: Record<string, string | number>): string {
    return uiTxt(this.uiLang, key, vars);
  }

  private clearUserAppearance(): void {
    this.bar?.removeAttribute('data-tn-dot-style');
    document.getElementById(USER_APPEARANCE_STYLE_ID)?.remove();
  }

  private applyUserAppearanceSync(a: TopicNavAppearanceStored): void {
    const bar = this.bar;
    if (!bar) return;
    if (a.dotStyle === 'solid') bar.removeAttribute('data-tn-dot-style');
    else bar.dataset.tnDotStyle = a.dotStyle;
    let tag = document.getElementById(USER_APPEARANCE_STYLE_ID);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = USER_APPEARANCE_STYLE_ID;
      document.head.appendChild(tag);
    }
    tag.textContent = buildTopicNavAppearanceStyle(a);
  }

  /** Language + capsule/dot theme from chrome.storage.sync (requires `this.bar`). */
  private async hydrateSyncedSettings(): Promise<void> {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage?.sync?.get) return;
      const bag = await chrome.storage.sync.get([STORAGE_TOPIC_NAV_APPEARANCE, STORAGE_TOPIC_NAV_UI]);
      const rawUi = bag[STORAGE_TOPIC_NAV_UI as keyof typeof bag];
      const prefs = parseTopicNavUiStored(rawUi) ?? defaultUiPrefs();
      this.uiLang = resolveUiLang(prefs.langPref);
      const rawA = bag[STORAGE_TOPIC_NAV_APPEARANCE as keyof typeof bag];
      const parsed = parseTopicNavAppearance(rawA);
      if (!parsed) this.clearUserAppearance();
      else this.applyUserAppearanceSync(parsed);
    } catch {
      /* ignore */
    }
  }

  start(): void {
    this.mountStyles();
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    window.addEventListener('wheel', this.onWheelHideTip, { capture: true, passive: true });
    this.refresh();
    this.attachMutationObserver();
    this.attachKeyboard();
  }

  destroy(): void {
    this.detachConversationScrollListeners();
    this.clearViewportSyncTimers();
    window.removeEventListener('wheel', this.onWheelHideTip, { capture: true });
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    if (this.onKeyDownBound) {
      window.removeEventListener('keydown', this.onKeyDownBound, true);
      this.onKeyDownBound = null;
    }
    this.bar?.remove();
    this.bar = null;
    this.panelList = null;
    this.searchInput = null;
    this.overlayEl = null;
    this.floatingTip = null;
    this.fabButton = null;
    this.stageEl = null;
    this.stageInner = null;
    document.getElementById(HOST_STYLE_ID)?.remove();
    document.getElementById(USER_APPEARANCE_STYLE_ID)?.remove();
  }

  refresh(): void {
    void this.refreshAsync();
  }

  private async refreshAsync(): Promise<void> {
    if (!this.adapter.matchesLocation(new URL(location.href))) {
      this.destroyExceptUi();
      return;
    }

    const roots = this.adapter.findTurnRoots(document);
    this.roots = roots;

    const scrollRoot =
      this.adapter.getScrollRoot(document) ??
      (this.roots[0] ? getScrollParent(this.roots[0]) : null) ??
      (document.scrollingElement as HTMLElement);

    if (!roots.length) {
      this.detachConversationScrollListeners();
      this.bar?.remove();
      this.bar = null;
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      this.panelList = null;
      this.searchInput = null;
      this.overlayEl = null;
      this.floatingTip = null;
      this.fabButton = null;
      this.stageEl = null;
      this.stageInner = null;
      this.dots = [];
      this.previewStrings = [];
      this.intersectionObserver?.disconnect();
      this.intersectionObserver = null;
      return;
    }

    const syncRoot = scrollRoot ?? document.documentElement;
    this.lastSyncScrollRoot = syncRoot;

    this.ensureBar();
    await this.hydrateSyncedSettings();

    this.previewStrings = roots.map((el, i) => {
      const p = extractTurnPreview(el).trim();
      return p.length > 0 ? p : this.ux('turnFallback', { n: i + 1 });
    });

    this.renderChrome();
    this.setupIntersection(syncRoot);
    this.attachConversationScrollListeners(syncRoot);

    queueMicrotask(() => {
      this.measureAndLayoutDots();
      this.syncActiveFromViewport(syncRoot);
      this.scrollRailToShowActiveDot(false);
    });
    requestAnimationFrame(() => {
      this.measureAndLayoutDots();
      this.syncActiveFromViewport(syncRoot);
      this.scrollRailToShowActiveDot(false);
    });

    /** Chat UIs hydrate after first paint — match Voyager-style delayed resync */
    this.clearViewportSyncTimers();
    const later = (): void => {
      if (!this.bar || !this.roots.length || !document.getElementById(BAR_ID)) return;
      const r = this.lastSyncScrollRoot ?? document.documentElement;
      this.measureAndLayoutDots();
      this.syncActiveFromViewport(r);
      this.scrollRailToShowActiveDot(false);
    };
    for (const d of [420, 1200]) {
      this.viewportSyncTimers.push(window.setTimeout(later, d));
    }
  }

  private destroyExceptUi(): void {
    this.detachConversationScrollListeners();
    this.clearViewportSyncTimers();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    if (this.onKeyDownBound) {
      window.removeEventListener('keydown', this.onKeyDownBound, true);
      this.onKeyDownBound = null;
    }
    this.bar?.remove();
    this.bar = null;
    this.panelList = null;
    this.searchInput = null;
    this.overlayEl = null;
    this.floatingTip = null;
    this.fabButton = null;
    this.stageEl = null;
    this.stageInner = null;
    this.roots = [];
    this.dots = [];
    this.previewStrings = [];
    this.activeIndex = -1;
    this.isPanelOpen = false;
    this.lastSyncScrollRoot = null;
  }

  private clearViewportSyncTimers(): void {
    this.viewportSyncTimers.forEach((t) => clearTimeout(t));
    this.viewportSyncTimers = [];
  }

  private detachConversationScrollListeners(): void {
    this.conversationScrollCtl?.abort();
    this.conversationScrollCtl = null;
  }

  /**
   * Chat hosts often nest scrollable panes — sync must listen on each (esp. ChatGPT thread).
   */
  private attachConversationScrollListeners(scrollLike: HTMLElement | Document): void {
    this.detachConversationScrollListeners();
    if (!this.roots.length) return;

    const ctl = new AbortController();
    this.conversationScrollCtl = ctl;
    const { signal } = ctl;

    let rafScheduled = false;
    const scheduleViewportSync = (): void => {
      if (!this.bar?.isConnected || signal.aborted) return;
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        rafScheduled = false;
        if (signal.aborted || !this.roots.length) return;
        const sr = this.lastSyncScrollRoot ?? document.documentElement;
        this.syncActiveFromViewport(sr);
        this.scrollRailToShowActiveDot(false);
      });
    };

    const scrollOpts: AddEventListenerOptions = { passive: true, capture: false, signal };
    const targets = new Set<EventTarget>();

    if (
      scrollLike instanceof HTMLElement &&
      scrollLike !== document.documentElement &&
      scrollLike !== document.body
    ) {
      targets.add(scrollLike);

      let n: HTMLElement | null = this.roots[0];
      while (n && scrollLike.contains(n)) {
        const oy = window.getComputedStyle(n).overflowY;
        if (
          (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
          n.scrollHeight > n.clientHeight + 6
        ) {
          targets.add(n);
        }
        n = n.parentElement;
      }
    }

    targets.add(window);

    if (this.adapter.id === 'chatgpt') {
      document.addEventListener('scroll', scheduleViewportSync, {
        passive: true,
        capture: true,
        signal,
      });
      for (const el of this.collectChatgptThreadScrollers()) {
        targets.add(el);
      }
      const vv = window.visualViewport;
      if (vv) {
        vv.addEventListener('scroll', scheduleViewportSync, { passive: true, signal });
        vv.addEventListener('resize', scheduleViewportSync, { passive: true, signal });
      }
    }

    for (const target of targets) {
      target.addEventListener('scroll', scheduleViewportSync, scrollOpts);
    }
  }

  /** ChatGPT often scrolls a deep flex child under `<main>`, not the element `getScrollParent` alone hits. */
  private collectChatgptThreadScrollers(max = 64): HTMLElement[] {
    const main = document.querySelector('main');
    if (!main) return [];
    const out: HTMLElement[] = [];
    const visit = (node: HTMLElement): void => {
      if (out.length >= max) return;
      for (const child of node.children) {
        if (!(child instanceof HTMLElement)) continue;
        if (out.length >= max) return;
        const oy = window.getComputedStyle(child).overflowY;
        if (
          (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
          child.scrollHeight > child.clientHeight + 10
        ) {
          out.push(child);
        }
        visit(child);
      }
    };
    visit(main);
    return out;
  }

  private stripeIntersectPx(
    rect: DOMRectReadOnly | DOMRect,
    stripTop: number,
    stripBottom: number,
  ): number {
    const top = Math.max(rect.top, stripTop);
    const bot = Math.min(rect.bottom, stripBottom);
    return Math.max(0, bot - top);
  }

  /** Prefer prose block over header chrome — turns activate when body starts to show */
  private messageContentCue(el: HTMLElement): HTMLElement {
    return (
      el.querySelector<HTMLElement>(
        '[data-message-content], [data-turn-copy], article .markdown, .markdown, .prose, .whitespace-pre-wrap',
      ) ?? el
    );
  }

  private scrollCueTopPaddingPx(): number {
    const v = this.adapter.scrollCueTopPaddingPx;
    return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : SCROLL_ABOVE_CUE_PX_DEFAULT;
  }

  /**
   * Maximise cue visibility in scrolling strip (+ fractional overlap) rather than outer card top crossing a band.
   */
  private computeActiveIndexNearViewport(scrollRootLike: HTMLElement | Document): number {
    if (!this.roots.length) return -1;

    let stripTop = 0;
    let stripBottom = typeof window !== 'undefined' ? window.innerHeight : 720;

    if (
      scrollRootLike instanceof HTMLElement &&
      scrollRootLike !== document.documentElement &&
      scrollRootLike !== document.body
    ) {
      const br = scrollRootLike.getBoundingClientRect();
      stripTop = br.top;
      stripBottom = br.bottom;
    }

    const stripeH = Math.max(80, stripBottom - stripTop);
    let bestIdx = 0;
    let bestScore = -Infinity;
    let maxPixAll = -1;

    for (let i = 0; i < this.roots.length; i++) {
      const root = this.roots[i];
      const cueEl = this.messageContentCue(root);
      const cueR = cueEl.getBoundingClientRect();
      let pix = this.stripeIntersectPx(cueR, stripTop, stripBottom);

      if (pix < 26 && cueEl !== root) {
        const outerR = root.getBoundingClientRect();
        pix = Math.max(pix, this.stripeIntersectPx(outerR, stripTop, stripBottom) * 0.42);
      }

      maxPixAll = Math.max(maxPixAll, pix);

      const h = Math.max(cueR.height, 28);
      const frac = pix / Math.min(h, stripeH);
      const score = pix * 200 + frac * 360;

      if (score > bestScore + 6) {
        bestScore = score;
        bestIdx = i;
      } else if (score >= bestScore - 14 && pix >= 12 && i > bestIdx) {
        bestIdx = i;
      }
    }

    if (bestScore < 540 && maxPixAll < 64) {
      const focus = stripTop + stripeH * 0.42;
      let spy = 0;
      for (let i = 0; i < this.roots.length; i++) {
        const cueR = this.messageContentCue(this.roots[i]).getBoundingClientRect();
        const lead = cueR.top + Math.min(Math.max(cueR.height * 0.06, 4), 16);
        if (lead <= focus + 34) spy = i;
        else break;
      }
      bestIdx = spy;
    }

    const lastR = this.roots[this.roots.length - 1].getBoundingClientRect();
    if (lastR.bottom <= stripBottom + 22 && maxPixAll < 48) bestIdx = this.roots.length - 1;

    return Math.min(Math.max(bestIdx, 0), this.roots.length - 1);
  }

  private syncActiveFromViewport(scrollRootLike: HTMLElement | Document): void {
    const idx = this.computeActiveIndexNearViewport(scrollRootLike);
    if (idx >= 0) this.highlightActive(idx);
  }

  private scrollRailToShowActiveDot(smooth?: boolean): void {
    const stage = this.stageEl;
    const dot = this.activeIndex >= 0 ? this.dots[this.activeIndex] : null;
    if (!stage || !dot?.isConnected) return;
    const beh = smooth ? 'smooth' : ('auto' as ScrollBehavior);
    try {
      dot.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: beh });
    } catch {
      dot.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  private mountStyles(): void {
    if (document.getElementById(HOST_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = HOST_STYLE_ID;
    s.textContent = HOST_STYLES;
    document.head.appendChild(s);
  }

  private ensureBar(): void {
    if (this.bar) return;
    const bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.setAttribute('data-topic-navigator', '');
    document.documentElement.appendChild(bar);
    this.bar = bar;

    const tip = document.createElement('div');
    tip.className = 'topic-nav-tooltip-float';
    tip.setAttribute('role', 'tooltip');
    bar.appendChild(tip);
    this.floatingTip = tip;
  }

  private hideTooltip(immediate?: boolean): void {
    if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
    const hide = (): void => {
      this.floatingTip?.classList.remove('topic-nav-tooltip-float--visible');
    };
    if (immediate) hide();
    else this.tooltipHideTimer = window.setTimeout(hide, 100);
  }

  private positionTooltip(dot: HTMLElement): void {
    const tip = this.floatingTip;
    if (!tip || !tip.textContent) return;

    tip.classList.add('topic-nav-tooltip-float--visible');
    tip.style.left = '';
    tip.style.top = '';

    const r = dot.getBoundingClientRect();
    const pad = 8;
    tip.style.visibility = 'hidden';

    requestAnimationFrame(() => {
      if (!tip.isConnected || !dot.isConnected) return;
      tip.style.visibility = '';
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      let left = r.left - tw - 14;
      let top = r.top + r.height / 2 - th / 2;

      if (left < pad) left = Math.min(r.right + 14, window.innerWidth - tw - pad);
      top = Math.max(pad, Math.min(top, window.innerHeight - th - pad));
      left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));

      tip.style.left = `${Math.round(left)}px`;
      tip.style.top = `${Math.round(top)}px`;
    });
  }

  /** `aria-label` for a timeline dot — uses excerpt only when DOM actually has preview text */
  private dotAccessibilityLabel(index: number): string {
    const root = this.roots[index];
    const extractedOk = !!(root && extractTurnPreview(root).trim().length > 0);
    const n = index + 1;
    const preview = this.previewStrings[index] ?? '';
    return extractedOk
      ? this.ux('turnAriaWithPreview', { n, preview })
      : this.ux('turnAria', { n });
  }

  private bindDotHover(dot: HTMLElement, preview: string, index: number): void {
    const n = index + 1;
    const text = `${n}. ${preview}`;
    const dotAria = this.dotAccessibilityLabel(index);

    dot.addEventListener('mouseenter', () => {
      if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
      const tip = this.floatingTip;
      if (!tip) return;
      tip.textContent = text;
      dot.setAttribute('aria-label', dotAria);
      this.positionTooltip(dot);
    });
    dot.addEventListener('mouseleave', () => this.hideTooltip());
    dot.addEventListener('focus', () => {
      dot.setAttribute('aria-label', dotAria);
      const tip = this.floatingTip;
      if (!tip) return;
      tip.textContent = text;
      this.positionTooltip(dot);
    });
    dot.addEventListener('blur', () => this.hideTooltip(true));
  }

  private closeOutlinePanel(): void {
    this.isPanelOpen = false;
    this.overlayEl?.classList.remove('topic-nav-overlay--open');
    this.overlayEl?.setAttribute('aria-hidden', 'true');
    this.fabButton?.setAttribute('aria-expanded', 'false');
    this.fabButton?.setAttribute('aria-label', this.ux('fabOpenList'));
    this.hideTooltip(true);
  }

  private openOutlinePanel(): void {
    this.isPanelOpen = true;
    this.overlayEl?.classList.add('topic-nav-overlay--open');
    this.overlayEl?.setAttribute('aria-hidden', 'false');
    this.fabButton?.setAttribute('aria-expanded', 'true');
    this.fabButton?.setAttribute('aria-label', this.ux('fabCloseList'));
    queueMicrotask(() => {
      this.updatePanelHighlight();
      this.searchInput?.focus({ preventScroll: true });
    });
  }

  private measureAndLayoutDots(): void {
    if (!this.stageEl || !this.stageInner) return;
    const shell = this.stageEl;
    const inner = this.stageInner;
    const n = this.roots.length;
    const slots = inner.querySelectorAll<HTMLElement>('.topic-nav-marker-slot');

    const H = shell.clientHeight;
    const minInner = n <= 1 ? H : STAGE_VERTICAL_PAD_PX * 2 + (n - 1) * MIN_DOT_SPACING_PX;
    const innerH = Math.max(H, minInner);
    inner.style.height = `${innerH}px`;

    slots.forEach((slot, i) => {
      if (n === 1) {
        slot.style.top = `${innerH / 2}px`;
        return;
      }
      const span = innerH - STAGE_VERTICAL_PAD_PX * 2;
      const y = STAGE_VERTICAL_PAD_PX + (span * i) / (n - 1);
      slot.style.top = `${y}px`;
    });
  }

  private attachStageResizeObserver(): void {
    this.resizeObserver?.disconnect();
    if (!this.stageEl) return;
    this.resizeObserver = new ResizeObserver(() => {
      queueMicrotask(() => this.measureAndLayoutDots());
    });
    this.resizeObserver.observe(this.stageEl);
  }

  private renderChrome(): void {
    if (!this.bar) return;
    this.resizeObserver?.disconnect();
    const keepTip = this.floatingTip;
    this.bar.replaceChildren();
    if (keepTip) this.bar.appendChild(keepTip);
    else {
      const tip = document.createElement('div');
      tip.className = 'topic-nav-tooltip-float';
      tip.setAttribute('role', 'tooltip');
      this.bar.appendChild(tip);
      this.floatingTip = tip;
    }

    const overlay = document.createElement('div');
    overlay.className = `topic-nav-overlay${this.isPanelOpen ? ' topic-nav-overlay--open' : ''}`;
    overlay.setAttribute('aria-hidden', (!this.isPanelOpen).toString());

    const backdrop = document.createElement('div');
    backdrop.className = 'topic-nav-backdrop';
    backdrop.addEventListener('click', () => this.closeOutlinePanel());

    const sheet = document.createElement('div');
    sheet.className = 'topic-nav-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', this.ux('outlineDialogAria'));

    sheet.innerHTML = `
      <div class="topic-nav-panel-head">
        <input type="search" class="topic-nav-search" placeholder="${escapeAttr(this.ux('searchTurnsPlaceholder'))}"
          autocomplete="off" spellcheck="false" aria-label="${escapeAttr(this.ux('searchTurnsAria'))}"/>
      </div>
      <div class="topic-nav-panel-body topic-nav-summary-list"></div>
    `;
    overlay.appendChild(backdrop);
    overlay.appendChild(sheet);
    this.overlayEl = overlay;

    const list = sheet.querySelector('.topic-nav-summary-list') as HTMLElement;
    const query = sheet.querySelector('.topic-nav-search') as HTMLInputElement;
    this.panelList = list;
    this.searchInput = query;
    query.addEventListener('input', () => this.rebuildPanelRows());
    query.addEventListener('keydown', (e) => e.stopPropagation());
    backdrop.addEventListener('keydown', (e) => e.stopPropagation());

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'topic-nav-fab';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-expanded', this.isPanelOpen ? 'true' : 'false');
    fab.setAttribute(
      'aria-label',
      this.isPanelOpen ? this.ux('fabCloseList') : this.ux('fabOpenList'),
    );
    fab.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/></svg>`;
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isPanelOpen) this.closeOutlinePanel();
      else this.openOutlinePanel();
      overlay.setAttribute('aria-hidden', (!this.isPanelOpen).toString());
      fab.setAttribute(
        'aria-label',
        this.isPanelOpen ? this.ux('fabCloseList') : this.ux('fabOpenList'),
      );
      fab.setAttribute('aria-expanded', this.isPanelOpen ? 'true' : 'false');
    });
    this.fabButton = fab;

    const stageShell = document.createElement('div');
    stageShell.className = 'topic-nav-stage-shell';

    const stage = document.createElement('div');
    stage.className = 'topic-nav-stage';
    const stageInner = document.createElement('div');
    stageInner.className = 'topic-nav-stage-inner';
    this.stageEl = stage;
    this.stageInner = stageInner;

    const dotN = this.roots.length;
    this.dots = [];
    for (let i = 0; i < dotN; i++) {
      const slot = document.createElement('div');
      slot.className = 'topic-nav-marker-slot';

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'topic-nav-dot';
      const brief = this.previewStrings[i] ?? '';
      dot.setAttribute('aria-label', this.dotAccessibilityLabel(i));
      dot.addEventListener('click', () => this.scrollToIndex(i));
      this.bindDotHover(dot, brief, i);

      slot.appendChild(dot);
      stageInner.appendChild(slot);
      this.dots.push(dot);
    }

    stage.appendChild(stageInner);
    stageShell.appendChild(stage);

    sheet.addEventListener('click', (e) => e.stopPropagation());

    this.bar.appendChild(overlay);
    this.bar.appendChild(fab);
    this.bar.appendChild(stageShell);

    this.attachStageResizeObserver();
    queueMicrotask(() => this.measureAndLayoutDots());

    this.rebuildPanelRows();
    if (this.isPanelOpen) queueMicrotask(() => query.focus({ preventScroll: true }));
  }

  private rebuildPanelRows(): void {
    if (!this.panelList || !this.searchInput) return;
    const q = this.searchInput.value.trim().toLowerCase();
    this.panelList.replaceChildren();

    this.roots.forEach((_, i) => {
      const text = this.previewStrings[i] ?? '';
      const num = String(i + 1);
      if (q !== '' && !text.toLowerCase().includes(q) && !num.includes(q)) return;

      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'topic-nav-summary-row';
      row.dataset.topicIndex = String(i);
      row.setAttribute(
        'aria-label',
        text.trim()
          ? this.ux('outlineRowAria', { n: Number(num), text })
          : this.ux('turnAria', { n: Number(num) }),
      );

      const idx = document.createElement('span');
      idx.className = 'topic-nav-summary-idx';
      idx.textContent = num;

      const span = document.createElement('span');
      span.className = 'topic-nav-summary-text';
      span.textContent = text || this.ux('turnFallback', { n: Number(num) });

      row.append(idx, span);
      row.addEventListener('click', () => this.scrollToIndex(i));
      this.panelList!.appendChild(row);
    });

    this.updatePanelHighlight();
  }

  private scrollToIndex(i: number): void {
    const el = this.roots[i];
    if (!el) return;
    const behavior: ScrollBehavior = 'smooth';
    const scrollEl =
      this.adapter.getScrollRoot(document) ??
      getScrollParent(el) ??
      (document.scrollingElement as HTMLElement | null);
    const cue = this.messageContentCue(el);

    const scrollInner = (): boolean => {
      if (!scrollEl || scrollEl === document.body || scrollEl === document.documentElement) return false;
      const sr = scrollEl as HTMLElement;
      const srRect = sr.getBoundingClientRect();
      const cueRect = cue.getBoundingClientRect();
      const relTop = cueRect.top - srRect.top + sr.scrollTop;

      if (i === 0) sr.scrollTo({ top: 0, behavior });
      else sr.scrollTo({ top: Math.max(0, relTop - this.scrollCueTopPaddingPx()), behavior });
      return true;
    };

    if (!scrollInner()) {
      if (i === 0) window.scrollTo({ top: 0, behavior });
      else {
        const cueY = cue.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, cueY - this.scrollCueTopPaddingPx()), behavior });
      }
    }

    queueMicrotask(() => {
      this.highlightActive(i);
      this.scrollRailToShowActiveDot(false);
    });
  }

  private setupIntersection(scrollRootLike: HTMLElement | Document): void {
    this.intersectionObserver?.disconnect();

    const root: Element | null = ((): Element | null => {
      if (scrollRootLike instanceof Document || scrollRootLike === document.documentElement) {
        return null;
      }
      return scrollRootLike;
    })();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        let bestRatio = -1;
        let bestIdx = -1;
        entries.forEach((e) => {
          if (!(e.target instanceof HTMLElement)) return;
          const idx = this.roots.indexOf(e.target);
          if (idx >= 0 && e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            bestIdx = idx;
          }
        });
        if (bestIdx >= 0 && bestRatio > 0) {
          this.highlightActive(bestIdx, true);
        }
      },
      {
        root,
        rootMargin: '-8% 0px -58% 0px',
        threshold: [0, 0.02, 0.06, 0.14, 0.28, 0.48, 0.72, 1],
      },
    );

    this.roots.forEach((r) => this.intersectionObserver?.observe(r));
  }

  private highlightActive(idx: number, fromScrollIntersection?: boolean): void {
    if (idx < 0) return;
    this.activeIndex = idx;
    this.dots.forEach((d, j) => {
      d.classList.toggle('topic-nav-dot--active', j === idx);
    });
    this.updatePanelHighlight();
    /** Keep the blue dot inside the capsule when many markers + user scroll */
    if (fromScrollIntersection) queueMicrotask(() => this.scrollRailToShowActiveDot(true));
  }

  private updatePanelHighlight(): void {
    if (!this.panelList || this.activeIndex < 0) return;
    this.panelList.querySelectorAll('.topic-nav-summary-row').forEach((el) => {
      const hx = Number((el as HTMLElement).dataset.topicIndex);
      el.classList.toggle('topic-nav-summary-row--active', hx === this.activeIndex);
    });
    if (!this.isPanelOpen) return;
    const sel = `.topic-nav-summary-row[data-topic-index="${this.activeIndex}"]`;
    const row = this.panelList.querySelector(sel) as HTMLElement | null;
    row?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  private scheduleRefresh(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      if (!this.adapter.matchesLocation(new URL(location.href))) return;
      this.refresh();
      this.debounceTimer = undefined;
    }, 200);
  }

  private attachMutationObserver(): void {
    const target =
      this.adapter.getObserveRoot(document) ??
      this.adapter.getScrollRoot(document) ??
      document.body;
    if (!target) return;
    this.mutationObserver = new MutationObserver(() => this.scheduleRefresh());
    this.mutationObserver.observe(target, {
      childList: true,
      subtree: true,
    });
  }

  private attachKeyboard(): void {
    if (this.onKeyDownBound) {
      window.removeEventListener('keydown', this.onKeyDownBound, true);
    }
    this.onKeyDownBound = (e: KeyboardEvent): void => {
      if (!this.bar || !this.roots.length) return;

      if (e.key === 'Escape' && this.isPanelOpen) {
        const t = e.target as HTMLElement | null;
        if (t?.closest(`#${BAR_ID}`)) {
          this.closeOutlinePanel();
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (e.key === 'j' || e.key === 'J') {
        const next = Math.min(this.roots.length - 1, this.activeIndex + 1);
        if (next !== this.activeIndex) {
          e.preventDefault();
          this.scrollToIndex(next);
        }
      } else if (e.key === 'k' || e.key === 'K') {
        const prev = Math.max(0, this.activeIndex - 1);
        if (prev !== this.activeIndex) {
          e.preventDefault();
          this.scrollToIndex(prev);
        }
      }
    };

    window.addEventListener('keydown', this.onKeyDownBound, true);
  }
}