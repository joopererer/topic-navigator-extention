/**
 * Persisted capsule / dot visuals (extension popup → content page CSS vars).
 */

export const STORAGE_TOPIC_NAV_APPEARANCE = 'topicNav_appearance_v1' as const;

export type TopicNavDotStyle = 'solid' | 'hollow' | 'outline';

/** Current schema (dots: shared shape; inactive/active each have fill+border incl. opacity & width). */
export interface TopicNavAppearanceStored {
  readonly v: 2;
  shellWidthPx: number;
  trackBgHex: string;
  trackBgOpacityPct: number;
  trackBorderHex: string;
  trackBorderOpacityPct: number;

  /** Applied to inactive + active fills (inactive transparent for hollow/outline). */
  dotStyle: TopicNavDotStyle;

  dotIdleBgHex: string;
  dotIdleBgOpacityPct: number;
  dotIdleBorderHex: string;
  dotIdleBorderOpacityPct: number;
  dotIdleBorderWidthPx: number;

  dotActiveBgHex: string;
  dotActiveBgOpacityPct: number;
  dotActiveBorderHex: string;
  dotActiveBorderOpacityPct: number;
  dotActiveBorderWidthPx: number;
}

interface LegacyAppearanceV1 {
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
  v: 2,
  shellWidthPx: 20,
  trackBgHex: '#e8eaef',
  trackBgOpacityPct: 94,
  trackBorderHex: '#1a1a1e',
  trackBorderOpacityPct: 14,

  dotStyle: 'solid',

  dotIdleBgHex: '#d1d5db',
  dotIdleBgOpacityPct: 100,
  dotIdleBorderHex: '#374151',
  dotIdleBorderOpacityPct: 40,
  dotIdleBorderWidthPx: 1.5,

  dotActiveBgHex: '#2563eb',
  dotActiveBgOpacityPct: 100,
  dotActiveBorderHex: '#1d4ed8',
  dotActiveBorderOpacityPct: 100,
  dotActiveBorderWidthPx: 2,
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

/** For popup hex fields: normalize `#rgb` / `#rrggbb`; invalid strings fall back. */
export function normalizeAppearanceHex(hex: string, fallback: string): string {
  return normalizeHex(hex, fallback);
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

function migrateV1toV2(o: LegacyAppearanceV1): TopicNavAppearanceStored {
  return {
    v: 2,
    shellWidthPx: Math.round(num(o.shellWidthPx, DEF.shellWidthPx, 12, 40)),
    trackBgHex: normalizeHex(o.trackBgHex, DEF.trackBgHex),
    trackBgOpacityPct: Math.round(num(o.trackBgOpacityPct, DEF.trackBgOpacityPct, 0, 100)),
    trackBorderHex: normalizeHex(o.trackBorderHex, DEF.trackBorderHex),
    trackBorderOpacityPct: Math.round(num(o.trackBorderOpacityPct, DEF.trackBorderOpacityPct, 0, 100)),
    dotStyle: style(o.dotStyle),
    dotIdleBgHex: normalizeHex(o.dotIdleBgHex, DEF.dotIdleBgHex),
    dotIdleBgOpacityPct: 100,
    dotIdleBorderHex: normalizeHex(o.dotIdleBorderHex, DEF.dotIdleBorderHex),
    dotIdleBorderOpacityPct: Math.round(num(o.dotIdleBorderOpacityPct, DEF.dotIdleBorderOpacityPct, 0, 100)),
    dotIdleBorderWidthPx: 1.5,
    dotActiveBgHex: normalizeHex(o.dotActiveBgHex, DEF.dotActiveBgHex),
    dotActiveBgOpacityPct: 100,
    dotActiveBorderHex: normalizeHex(o.dotActiveBorderHex, DEF.dotActiveBorderHex),
    dotActiveBorderOpacityPct: 100,
    dotActiveBorderWidthPx: 2,
  };
}

function normalizeV2(o: Partial<TopicNavAppearanceStored>): TopicNavAppearanceStored {
  return {
    v: 2,
    shellWidthPx: Math.round(num(o.shellWidthPx, DEF.shellWidthPx, 12, 40)),
    trackBgHex: normalizeHex(o.trackBgHex, DEF.trackBgHex),
    trackBgOpacityPct: Math.round(num(o.trackBgOpacityPct, DEF.trackBgOpacityPct, 0, 100)),
    trackBorderHex: normalizeHex(o.trackBorderHex, DEF.trackBorderHex),
    trackBorderOpacityPct: Math.round(num(o.trackBorderOpacityPct, DEF.trackBorderOpacityPct, 0, 100)),
    dotStyle: style(o.dotStyle),
    dotIdleBgHex: normalizeHex(o.dotIdleBgHex, DEF.dotIdleBgHex),
    dotIdleBgOpacityPct: Math.round(num(o.dotIdleBgOpacityPct, DEF.dotIdleBgOpacityPct, 0, 100)),
    dotIdleBorderHex: normalizeHex(o.dotIdleBorderHex, DEF.dotIdleBorderHex),
    dotIdleBorderOpacityPct: Math.round(num(o.dotIdleBorderOpacityPct, DEF.dotIdleBorderOpacityPct, 0, 100)),
    dotIdleBorderWidthPx: num(o.dotIdleBorderWidthPx, DEF.dotIdleBorderWidthPx, 1, 8),
    dotActiveBgHex: normalizeHex(o.dotActiveBgHex, DEF.dotActiveBgHex),
    dotActiveBgOpacityPct: Math.round(num(o.dotActiveBgOpacityPct, DEF.dotActiveBgOpacityPct, 0, 100)),
    dotActiveBorderHex: normalizeHex(o.dotActiveBorderHex, DEF.dotActiveBorderHex),
    dotActiveBorderOpacityPct: Math.round(num(o.dotActiveBorderOpacityPct, DEF.dotActiveBorderOpacityPct, 0, 100)),
    dotActiveBorderWidthPx: num(o.dotActiveBorderWidthPx, DEF.dotActiveBorderWidthPx, 1, 10),
  };
}

function effectiveOutlineBorderWidths(a: TopicNavAppearanceStored): { idle: number; active: number } {
  let idle = clamp(a.dotIdleBorderWidthPx, 1, 8);
  let active = clamp(a.dotActiveBorderWidthPx, 1, 10);
  if (a.dotStyle === 'outline') {
    idle = Math.max(idle, 2.5);
    active = Math.max(active, 2.75);
  }
  return { idle, active };
}

/** Coalesce unknown persisted JSON → safe stored shape (migrates v1 → v2). */
export function parseTopicNavAppearance(raw: unknown): TopicNavAppearanceStored | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as { v?: number } & Record<string, unknown>;
  if (o.v === 1) return migrateV1toV2(o as unknown as LegacyAppearanceV1);
  if (o.v === 2) return normalizeV2(o as Partial<TopicNavAppearanceStored>);
  return null;
}

/** CSS custom properties on the host bar (applied after baseline `HOST_STYLES`). */
export function buildTopicNavAppearanceStyle(a: TopicNavAppearanceStored, barSelector = '#topic-navigator-bar'): string {
  const { idle: idleW, active: activeW } = effectiveOutlineBorderWidths(a);

  const idleBg = rgbaFromHex(a.dotIdleBgHex, a.dotIdleBgOpacityPct);
  const activeBg = rgbaFromHex(a.dotActiveBgHex, a.dotActiveBgOpacityPct);
  const idleBorder = rgbaFromHex(a.dotIdleBorderHex, a.dotIdleBorderOpacityPct);
  const activeBorder = rgbaFromHex(a.dotActiveBorderHex, a.dotActiveBorderOpacityPct);

  return [
    `${barSelector} {`,
    `  --tn-shell-width: ${a.shellWidthPx}px;`,
    `  --tn-stage-bg: ${rgbaFromHex(a.trackBgHex, a.trackBgOpacityPct)};`,
    `  --tn-stage-border: ${rgbaFromHex(a.trackBorderHex, a.trackBorderOpacityPct)};`,
    `  --tn-dot-idle-bg: ${idleBg};`,
    `  --tn-dot-idle-border: ${idleBorder};`,
    `  --tn-dot-idle-border-w: ${idleW}px;`,
    `  --tn-dot-active-bg: ${activeBg};`,
    `  --tn-dot-active-border: ${activeBorder};`,
    `  --tn-dot-active-border-w: ${activeW}px;`,
    `}`,
  ].join('\n');
}
