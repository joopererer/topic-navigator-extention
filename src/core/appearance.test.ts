import { describe, expect, it } from 'vitest';
import { hexToRgb, parseTopicNavAppearance, rgbaFromHex } from './appearance.js';

describe('appearance', () => {
  it('normalizes short hex and parses rgba', () => {
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(rgbaFromHex('#ff0000', 50)).toMatch(/^rgba\(255,\s*0,\s*0,\s*0\.500\)/);
  });

  it('migrates legacy v1 snapshot to v2', () => {
    const x = parseTopicNavAppearance({
      v: 1,
      shellWidthPx: 22,
      trackBgHex: '#aabbcc',
      trackBgOpacityPct: 88,
      trackBorderHex: '#111111',
      trackBorderOpacityPct: 20,
      dotIdleBgHex: '#222222',
      dotIdleBorderHex: '#333333',
      dotIdleBorderOpacityPct: 55,
      dotActiveBgHex: '#444444',
      dotActiveBorderHex: '#555555',
      dotStyle: 'hollow',
    });
    expect(x?.v).toBe(2);
    expect(x?.shellWidthPx).toBe(22);
    expect(x?.dotIdleBgOpacityPct).toBe(100);
    expect(x?.dotIdleBorderWidthPx).toBe(1.5);
    expect(x?.dotStyle).toBe('hollow');
  });

  it('accepts v2 payload', () => {
    const x = parseTopicNavAppearance({
      v: 2,
      shellWidthPx: 18,
      trackBgHex: '#112233',
      trackBgOpacityPct: 80,
      trackBorderHex: '#445566',
      trackBorderOpacityPct: 22,
      dotStyle: 'outline',
      dotIdleBgHex: '#ddeeff',
      dotIdleBgOpacityPct: 90,
      dotIdleBorderHex: '#001122',
      dotIdleBorderOpacityPct: 50,
      dotIdleBorderWidthPx: 2.2,
      dotActiveBgHex: '#2563eb',
      dotActiveBgOpacityPct: 95,
      dotActiveBorderHex: '#1e40af',
      dotActiveBorderOpacityPct: 80,
      dotActiveBorderWidthPx: 3.1,
    });
    expect(x?.dotIdleBorderWidthPx).toBeCloseTo(2.2);
    expect(x?.dotActiveBorderWidthPx).toBeCloseTo(3.1);
    expect(x?.dotStyle).toBe('outline');
  });
});
