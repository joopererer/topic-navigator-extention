import { parseTopicNavAppearance, type TopicNavAppearanceStored } from './appearance.js';

export const STORAGE_TOPIC_NAV_APPEARANCE_PRESETS = 'topicNav_appearance_presets_v1' as const;

export interface TopicNavAppearancePresetsStored {
  readonly v: 1;
  /** Three user slots; `null` = empty */
  slots: [TopicNavAppearanceStored | null, TopicNavAppearanceStored | null, TopicNavAppearanceStored | null];
}

export function defaultAppearancePresets(): TopicNavAppearancePresetsStored {
  return { v: 1, slots: [null, null, null] };
}

function slotOrNull(x: unknown): TopicNavAppearanceStored | null {
  if (x === null || x === undefined) return null;
  return parseTopicNavAppearance(x);
}

export function parseAppearancePresets(raw: unknown): TopicNavAppearancePresetsStored | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<TopicNavAppearancePresetsStored>;
  if (o.v !== 1 || !Array.isArray(o.slots) || o.slots.length !== 3) return null;
  const slots = o.slots.map((s) => slotOrNull(s)) as TopicNavAppearancePresetsStored['slots'];
  return { v: 1, slots };
}

export function setPresetSlot(
  cur: TopicNavAppearancePresetsStored,
  index: 0 | 1 | 2,
  app: TopicNavAppearanceStored,
): TopicNavAppearancePresetsStored {
  const slots: TopicNavAppearancePresetsStored['slots'] = [...cur.slots];
  slots[index] = app;
  return { v: 1, slots };
}
