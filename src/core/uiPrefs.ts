/**
 * UI language preference (extension pages + injected chrome).
 * `auto`: follow browser UI language (`chrome.i18n.getUILanguage` / `navigator.language`), else fallback English.
 */

export const STORAGE_TOPIC_NAV_UI = 'topicNav_ui_v1' as const;

export type UiLangCode = 'en' | 'zh' | 'fr';
export type UiLangPref = 'auto' | UiLangCode;

export interface TopicNavUiStored {
  readonly v: 1;
  langPref: UiLangPref;
}

export function defaultUiPrefs(): TopicNavUiStored {
  return { v: 1, langPref: 'auto' };
}

/** Pick zh / fr / supported, else English. */
export function resolveUiLang(pref: UiLangPref): UiLangCode {
  if (pref === 'zh' || pref === 'fr' || pref === 'en') return pref;
  try {
    const raw =
      typeof chrome !== 'undefined' && typeof chrome.i18n?.getUILanguage === 'function'
        ? chrome.i18n.getUILanguage()
        : typeof navigator !== 'undefined'
          ? navigator.language
          : 'en';
    const low = String(raw).toLowerCase();
    if (low.startsWith('zh')) return 'zh';
    if (low.startsWith('fr')) return 'fr';
    return 'en';
  } catch {
    return 'en';
  }
}

export function parseTopicNavUiStored(raw: unknown): TopicNavUiStored | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<TopicNavUiStored>;
  if (o.v !== 1) return null;
  const p = o.langPref;
  const langPref: UiLangPref =
    p === 'auto' || p === 'zh' || p === 'fr' || p === 'en' ? p : 'auto';
  return { v: 1, langPref };
}
