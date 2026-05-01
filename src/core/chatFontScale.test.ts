import { describe, expect, it } from 'vitest';
import {
  CHAT_FONT_SCALE_DEFAULT,
  CHAT_FONT_SCALE_MAX,
  CHAT_FONT_SCALE_MIN,
  clampChatFontScale,
  parseChatFontScale,
} from './chatFontScale.js';

describe('chatFontScale', () => {
  it('clamps to min/max and snaps to step', () => {
    expect(clampChatFontScale(0.5)).toBe(CHAT_FONT_SCALE_MIN);
    expect(clampChatFontScale(2)).toBe(CHAT_FONT_SCALE_MAX);
    expect(clampChatFontScale(1.03)).toBe(1.05);
    expect(clampChatFontScale(1)).toBe(CHAT_FONT_SCALE_DEFAULT);
  });

  it('parses storage payloads', () => {
    expect(parseChatFontScale(undefined)).toBe(CHAT_FONT_SCALE_DEFAULT);
    expect(parseChatFontScale('1.1')).toBe(1.1);
    expect(parseChatFontScale(0.8)).toBe(0.8);
  });
});
