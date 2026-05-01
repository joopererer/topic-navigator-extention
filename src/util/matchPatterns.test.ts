import { describe, expect, it } from 'vitest';
import { hostsFromMatchPatterns, patternsToOriginPermissions } from './matchPatterns.js';

describe('hostsFromMatchPatterns', () => {
  it('extracts hostname from match pattern lines', () => {
    const h = hostsFromMatchPatterns([
      '',
      '# comment',
      'https://corp-onyx.app/chat/*',
      'http://127.0.0.1:3000/',
    ]);
    expect(h.has('corp-onyx.app')).toBe(true);
    expect(h.has('127.0.0.1')).toBe(true);
  });
});

describe('patternsToOriginPermissions', () => {
  it('requests broad origins for granted hosts', () => {
    const o = patternsToOriginPermissions(['https://a.example/chat*', 'http://b.example/*']);
    expect(o).toContain('https://a.example/*');
    expect(o).toContain('http://b.example/*');
  });
});
