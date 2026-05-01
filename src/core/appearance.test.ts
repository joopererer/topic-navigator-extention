import { describe, expect, it } from 'vitest';
import { hexToRgb, parseTopicNavAppearance, rgbaFromHex } from './appearance.js';

describe('appearance', () => {
  it('normalizes short hex and parses rgba', () => {
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(rgbaFromHex('#ff0000', 50)).toMatch(/^rgba\(255,\s*0,\s*0,\s*0\.500\)/);
  });

  it('rejects wrong schema version', () => {
    expect(parseTopicNavAppearance({ v: 0, shellWidthPx: 20 })).toBeNull();
  });

  it('accepts valid v1 payload', () => {
    const x = parseTopicNavAppearance({
      v: 1,
      shellWidthPx: 24,
      trackBgHex: '#112233',
      trackBgOpacityPct: 80,
      trackBorderHex: '#445566',
      trackBorderOpacityPct: 22,
      dotIdleBgHex: '#ddeeff',
      dotIdleBorderHex: '#001122',
      dotIdleBorderOpacityPct: 50,
      dotActiveBgHex: '#2563eb',
      dotActiveBorderHex: '#1e40af',
      dotStyle: 'hollow',
    });
    expect(x?.shellWidthPx).toBe(24);
    expect(x?.dotStyle).toBe('hollow');
  });
});
