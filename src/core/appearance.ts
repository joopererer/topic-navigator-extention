/**
 * Persisted capsule / dot visuals (edited from extension popup → applied in-page via CSS vars).
 */

export const STORAGE_TOPIC_NAV_APPEARANCE = 'topicNav_appearance_v1' as const;

export type TopicNavDotStyle = 'solid' | 'hollow' | 'outline';

export interface TopicNavAppearanceStored {
  /** Schema version — bump when renaming fields */
  readonly v: 1;
  shellWidthPx: number;
  trackBgHex: string;
  trackBgOpacityPct: number;
  trackBorderHex: string;
  trackBorderOpacityPct: number;
  dotIdleBgHex: string;
  dotIdleBorderHex: string;
  dotIdleBorderOpacityPct: number;
  dotActiveBgHex: string;
  dotActiveBorderHex: string;
  dotStyle: TopicNavDotStyle;
}

const DEF: TopicNavAppearanceStored = Object.freeze({
  v: 1,
  shellWidthPx: 20,
  trackBgHex: '#e8eaef',
  trackBgOpacityPct: 94,
  trackBorderHex: '#1a1a1e',
  trackBorderOpacityPct: 14,
  dotIdleBgHex: '#d1d5db',
  dotIdleBorderHex: '#374151',
  dotIdleBorderOpacityPct: 40,
  dotActiveBgHex: '#2563eb',
  dotActiveBorderHex: '#1d4ed8',
  dotStyle: 'solid',
});

export function defaultTopicNavAppearance(): TopicNavAppearanceStored {
  return { ...DEF };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function normalizeHex(hex: unknown, fb: string): string {
  if (typeof hex !== 'string') return fb;
  const t = hex.trim();
  if (/^#[0-9a-f]{3}$/i.test(t)) {
    const r = t[1],
      g = t[2],
      b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(t)) return t.toLowerCase();
  return fb;
}

/** Parse `#rrggbb` → `{ r,g,b }` or null */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = normalizeHex(hex, '').slice(1);
  if (h.length !== 6) return null;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

/** `opacityPct` in 0–100 */
export function rgbaFromHex(hex: string, opacityPct: number): string {
  const rgb = hexToRgb(normalizeHex(hex, DEF.trackBgHex)) ?? hexToRgb(DEF.trackBgHex)!;
  const a = clamp(opacityPct / 100, 0, 1);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a.toFixed(3)})`;
}

function num(x: unknown, fb: number, lo: number, hi: number): number {
  if (typeof x === 'number' && Number.isFinite(x)) return clamp(x, lo, hi);
  if (typeof x === 'string' && /^-?\d+(\.\d+)?$/.test(x.trim()))
    return clamp(Number.parseFloat(x.trim()), lo, hi);
  return fb;
}

function style(x: unknown): TopicNavDotStyle {
  if (x === 'solid' || x === 'hollow' || x === 'outline') return x;
  return DEF.dotStyle;
}

/** Coalesce unknown persisted JSON → safe stored shape */
export function parseTopicNavAppearance(raw: unknown): TopicNavAppearanceStored | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<TopicNavAppearanceStored>;
  if (o.v !== 1) return null;
  return {
    v: 1,
    shellWidthPx: Math.round(num(o.shellWidthPx, DEF.shellWidthPx, 12, 40)),
    trackBgHex: normalizeHex(o.trackBgHex, DEF.trackBgHex),
    trackBgOpacityPct: Math.round(num(o.trackBgOpacityPct, DEF.trackBgOpacityPct, 0, 100)),
    trackBorderHex: normalizeHex(o.trackBorderHex, DEF.trackBorderHex),
    trackBorderOpacityPct: Math.round(num(o.trackBorderOpacityPct, DEF.trackBorderOpacityPct, 0, 100)),
    dotIdleBgHex: normalizeHex(o.dotIdleBgHex, DEF.dotIdleBgHex),
    dotIdleBorderHex: normalizeHex(o.dotIdleBorderHex, DEF.dotIdleBorderHex),
    dotIdleBorderOpacityPct: Math.round(num(o.dotIdleBorderOpacityPct, DEF.dotIdleBorderOpacityPct, 0, 100)),
    dotActiveBgHex: normalizeHex(o.dotActiveBgHex, DEF.dotActiveBgHex),
    dotActiveBorderHex: normalizeHex(o.dotActiveBorderHex, DEF.dotActiveBorderHex),
    dotStyle: style(o.dotStyle),
  };
}

/** CSS custom properties on the host bar (applied after baseline `HOST_STYLES`). */
export function buildTopicNavAppearanceStyle(a: TopicNavAppearanceStored, barSelector = '#topic-navigator-bar'): string {
  const idleBorder = rgbaFromHex(a.dotIdleBorderHex, a.dotIdleBorderOpacityPct);

  return [
    `${barSelector} {`,
    `  --tn-shell-width: ${a.shellWidthPx}px;`,
    `  --tn-stage-bg: ${rgbaFromHex(a.trackBgHex, a.trackBgOpacityPct)};`,
    `  --tn-stage-border: ${rgbaFromHex(a.trackBorderHex, a.trackBorderOpacityPct)};`,
    `  --tn-dot-bg: ${a.dotIdleBgHex};`,
    `  --tn-dot-border: ${idleBorder};`,
    `  --tn-dot-active-bg: ${a.dotActiveBgHex};`,
    `  --tn-dot-active-border: ${a.dotActiveBorderHex};`,
    `}`,
  ].join('\n');
}
