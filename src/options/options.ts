import { patternsToOriginPermissions } from '../util/matchPatterns.js';
import { STORAGE_CUSTOM_ONYX } from '../core/types.js';
import {
  STORAGE_TOPIC_NAV_UI,
  defaultUiPrefs,
  parseTopicNavUiStored,
  resolveUiLang,
  type UiLangCode,
  type UiLangPref,
} from '../core/uiPrefs.js';
import { t, type UiStringKey } from '../core/uiStrings.js';

const ta = document.getElementById('patterns') as HTMLTextAreaElement;
const saveBtn = document.getElementById('save') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLParagraphElement;
const localePref = document.getElementById('localePref') as HTMLSelectElement;

function ux(lang: UiLangCode, key: UiStringKey, vars?: Record<string, string | number>): string {
  return t(lang, key, vars);
}

function linesFromTextarea(): string[] {
  return ta.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function prefFromSelect(): UiLangPref {
  const v = localePref.value;
  if (v === 'zh' || v === 'fr' || v === 'en') return v;
  return 'auto';
}

function langEffective(): UiLangCode {
  return resolveUiLang(prefFromSelect());
}

function refreshLocaleChoices(lang: UiLangCode): void {
  localePref.options[0]!.text = ux(lang, 'localeAuto');
  localePref.options[1]!.text = ux(lang, 'localeEn');
  localePref.options[2]!.text = ux(lang, 'localeZh');
  localePref.options[3]!.text = ux(lang, 'localeFr');
}

function buildIntro(lang: UiLangCode): void {
  const p = document.getElementById('introLine')!;
  p.replaceChildren();
  p.append(document.createTextNode(`${ux(lang, 'optionsOnyxIntro')} `));
  const a = document.createElement('a');
  a.href =
    'https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = ux(lang, 'optionsMatchPatternsLink');
  p.append(a, document.createTextNode(` ${ux(lang, 'optionsOnyxIntro2')}`));
}

function applyStrings(lang: UiLangCode): void {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang === 'fr' ? 'fr' : 'en';
  document.title = ux(lang, 'optionsBrowserTitle');

  refreshLocaleChoices(lang);
  document.getElementById('optTitle')!.textContent = ux(lang, 'optionsTitle');
  document.getElementById('localeLbl')!.textContent = ux(lang, 'optionsLocaleHeading');
  buildIntro(lang);
  document.getElementById('patternsLabel')!.textContent = ux(lang, 'optionsPatternsLabel');
  document.getElementById('examples')!.textContent = ux(lang, 'optionsExamples');
  saveBtn.textContent = ux(lang, 'optionsSave');
  ta.placeholder = ux(lang, 'optionsPatternsPlaceholder');
}

async function persistLocaleOnly(): Promise<void> {
  await chrome.storage.sync.set({
    [STORAGE_TOPIC_NAV_UI]: { v: 1, langPref: prefFromSelect() },
  });
  applyStrings(langEffective());
}

async function load(): Promise<void> {
  const res = await chrome.storage.sync.get([
    STORAGE_CUSTOM_ONYX,
    STORAGE_TOPIC_NAV_UI,
  ]);
  const cur = res[STORAGE_CUSTOM_ONYX];
  ta.value = Array.isArray(cur) ? (cur as string[]).join('\n') : '';

  const ui = parseTopicNavUiStored(res[STORAGE_TOPIC_NAV_UI as keyof typeof res]) ?? defaultUiPrefs();
  localePref.value = ui.langPref;
  applyStrings(langEffective());
}

async function save(): Promise<void> {
  status.textContent = '';
  const patterns = linesFromTextarea();
  const origins = patternsToOriginPermissions(patterns);

  if (origins.length) {
    const ok = await chrome.permissions.request({ origins });
    if (!ok) {
      status.textContent = ux(langEffective(), 'optionsStatusDenied');
      return;
    }
  }

  await chrome.storage.sync.set({
    [STORAGE_CUSTOM_ONYX]: patterns,
    [STORAGE_TOPIC_NAV_UI]: { v: 1, langPref: prefFromSelect() },
  });
  applyStrings(langEffective());
  status.textContent = ux(langEffective(), 'optionsStatusDone');
}

localePref.addEventListener('change', () => void persistLocaleOnly());
void load();
saveBtn.addEventListener('click', () => void save());
