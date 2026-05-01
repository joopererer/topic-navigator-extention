export const STORAGE_CHAT_FONT_SCALE = 'topicNav_chatFontScale_v1' as const;

export const CHAT_FONT_SCALE_DEFAULT = 1;
export const CHAT_FONT_SCALE_MIN = 0.75;
export const CHAT_FONT_SCALE_MAX = 1.5;
export const CHAT_FONT_SCALE_STEP = 0.05;

export function clampChatFontScale(n: number): number {
  if (!Number.isFinite(n)) return CHAT_FONT_SCALE_DEFAULT;
  const clamped = Math.min(CHAT_FONT_SCALE_MAX, Math.max(CHAT_FONT_SCALE_MIN, n));
  const snapped = Math.round(clamped / CHAT_FONT_SCALE_STEP) * CHAT_FONT_SCALE_STEP;
  return Number(snapped.toFixed(2));
}

/** Parse sync payload → clamped finite scale (default 1). */
export function parseChatFontScale(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return clampChatFontScale(raw);
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (/^-?\d+(\.\d+)?$/.test(t)) return clampChatFontScale(Number.parseFloat(t));
  }
  return CHAT_FONT_SCALE_DEFAULT;
}
