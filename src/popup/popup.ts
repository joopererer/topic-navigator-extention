import type { TopicNavAppearanceStored } from '../core/appearance.js';
import {
  STORAGE_TOPIC_NAV_APPEARANCE,
  STORAGE_TOPIC_NAV_APPEARANCE_LIVE_PREVIEW,
  defaultTopicNavAppearance,
  parseTopicNavAppearance,
} from '../core/appearance.js';
import {
  STORAGE_TOPIC_NAV_UI,
  defaultUiPrefs,
  parseTopicNavUiStored,
  resolveUiLang,
  type UiLangCode,
  type UiLangPref,
} from '../core/uiPrefs.js';
import { t, type UiStringKey } from '../core/uiStrings.js';

function getEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el;
}

const localePref = getEl('localePref') as HTMLSelectElement;
const shellWidth = getEl('shellWidth') as HTMLInputElement;
const trackBg = getEl('trackBg') as HTMLInputElement;
const trackBgOp = getEl('trackBgOp') as HTMLInputElement;
const trackBorder = getEl('trackBorder') as HTMLInputElement;
const trackBorderOp = getEl('trackBorderOp') as HTMLInputElement;
const dotIdleBg = getEl('dotIdleBg') as HTMLInputElement;
const dotIdleBgOp = getEl('dotIdleBgOp') as HTMLInputElement;
const dotIdleBorder = getEl('dotIdleBorder') as HTMLInputElement;
const dotIdleBorderOp = getEl('dotIdleBorderOp') as HTMLInputElement;
const dotIdleBorderW = getEl('dotIdleBorderW') as HTMLInputElement;
const dotActiveBg = getEl('dotActiveBg') as HTMLInputElement;
const dotActiveBgOp = getEl('dotActiveBgOp') as HTMLInputElement;
const dotActiveBorder = getEl('dotActiveBorder') as HTMLInputElement;
const dotActiveBorderOp = getEl('dotActiveBorderOp') as HTMLInputElement;
const dotActiveBorderW = getEl('dotActiveBorderW') as HTMLInputElement;
const dotStyle = getEl('dotStyle') as HTMLSelectElement;
const saveBtn = getEl('save') as HTMLButtonElement;
const resetBtn = getEl('reset') as HTMLButtonElement;
const openOpts = getEl('openOptions') as HTMLButtonElement;
const status = getEl('status') as HTMLParagraphElement;

const lblCapW = getEl('_lblCapW');
const lblTrackBg = getEl('_lblTrackBg');
const lblTrackBd = getEl('_lblTrackBd');
const lblDotShape = getEl('_lblDotShape');
const lblDotIdleBg = getEl('_lblDotIdleBg');
const lblDotIdleBd = getEl('_lblDotIdleBd');
const lblDotIdleBdW = getEl('_lblDotIdleBdW');
const lblDotActiveBg = getEl('_lblDotActiveBg');
const lblDotActiveBd = getEl('_lblDotActiveBd');
const lblDotActiveBdW = getEl('_lblDotActiveBdW');
const lblLocaleHeading = getEl('_lblLocaleHeading');

/** Serialized `readFromForm()` — skips redundant session writes while dragging */
let lastLivePreviewSerialized = '';
let previewDebounceTimer: number | undefined;

async function clearLivePreviewLocal(): Promise<void> {
  try {
    await chrome.storage.local.remove(STORAGE_TOPIC_NAV_APPEARANCE_LIVE_PREVIEW);
  } catch {
    /* ignore */
  }
}

function bumpSerializedBaseline(): void {
  lastLivePreviewSerialized = JSON.stringify(readFromForm());
}

function ux(lang: UiLangCode, key: UiStringKey, vars?: Record<string, string | number>): string {
  return t(lang, key, vars);
}

function prefFromSelect(): UiLangPref {
  const v = localePref.value;
  if (v === 'zh' || v === 'fr' || v === 'en') return v;
  return 'auto';
}

function langForChrome(): UiLangCode {
  return resolveUiLang(prefFromSelect());
}

function refreshLocaleChoices(lang: UiLangCode): void {
  localePref.options[0]!.text = ux(lang, 'localeAuto');
  localePref.options[1]!.text = ux(lang, 'localeEn');
  localePref.options[2]!.text = ux(lang, 'localeZh');
  localePref.options[3]!.text = ux(lang, 'localeFr');
}

function applyDotStyleOptionLabels(lang: UiLangCode): void {
  for (const opt of [...dotStyle.options]) {
    const k = opt.dataset.key as UiStringKey | undefined;
    if (k === 'dotStyleSolid' || k === 'dotStyleHollow' || k === 'dotStyleOutline') {
      opt.textContent = ux(lang, k);
    }
  }
}

function applyChromeStrings(lang: UiLangCode): void {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang === 'fr' ? 'fr' : 'en';
  document.title = ux(lang, 'popupTitle');

  refreshLocaleChoices(lang);
  getEl('_hTitle').textContent = ux(lang, 'popupTitle');
  getEl('_pSub').textContent = ux(lang, 'popupSubtitle');
  lblLocaleHeading.textContent = ux(lang, 'localeLabel');

  lblCapW.textContent = ux(lang, 'capsuleWidth', { w: `${shellWidth.value}px` });
  lblTrackBg.textContent = ux(lang, 'trackBgOpacity', { p: `${trackBgOp.value}%` });
  lblTrackBd.textContent = ux(lang, 'trackBorderOpacity', { p: `${trackBorderOp.value}%` });
  lblDotShape.textContent = ux(lang, 'dotUnifiedStyle');
  applyDotStyleOptionLabels(lang);
  lblDotIdleBg.textContent = `${ux(lang, 'dotInactiveBg')} · ${dotIdleBgOp.value}%`;
  lblDotIdleBd.textContent = `${ux(lang, 'dotInactiveBorder')} · ${dotIdleBorderOp.value}%`;
  lblDotIdleBdW.textContent = ux(lang, 'dotInactiveBorderWidth', {
    w: `${(Number(dotIdleBorderW.value) / 10).toFixed(1)}px`,
  });
  lblDotActiveBg.textContent = `${ux(lang, 'dotActiveBg')} · ${dotActiveBgOp.value}%`;
  lblDotActiveBd.textContent = `${ux(lang, 'dotActiveBorder')} · ${dotActiveBorderOp.value}%`;
  lblDotActiveBdW.textContent = ux(lang, 'dotActiveBorderWidth', {
    w: `${(Number(dotActiveBorderW.value) / 10).toFixed(1)}px`,
  });

  saveBtn.textContent = ux(lang, 'btnSave');
  resetBtn.textContent = ux(lang, 'btnReset');
  openOpts.textContent = ux(lang, 'btnOptions');
}

function hydrate(a: TopicNavAppearanceStored): void {
  shellWidth.value = String(a.shellWidthPx);
  trackBg.value = a.trackBgHex;
  trackBgOp.value = String(a.trackBgOpacityPct);
  trackBorder.value = a.trackBorderHex;
  trackBorderOp.value = String(a.trackBorderOpacityPct);
  dotIdleBg.value = a.dotIdleBgHex;
  dotIdleBgOp.value = String(a.dotIdleBgOpacityPct);
  dotIdleBorder.value = a.dotIdleBorderHex;
  dotIdleBorderOp.value = String(a.dotIdleBorderOpacityPct);
  dotIdleBorderW.value = String(Math.round(a.dotIdleBorderWidthPx * 10));
  dotActiveBg.value = a.dotActiveBgHex;
  dotActiveBgOp.value = String(a.dotActiveBgOpacityPct);
  dotActiveBorder.value = a.dotActiveBorderHex;
  dotActiveBorderOp.value = String(a.dotActiveBorderOpacityPct);
  dotActiveBorderW.value = String(Math.round(a.dotActiveBorderWidthPx * 10));
  dotStyle.value = a.dotStyle;
  applyChromeStrings(langForChrome());
}

function readFromForm(): TopicNavAppearanceStored {
  return (
    parseTopicNavAppearance({
      v: 2,
      shellWidthPx: Number(shellWidth.value),
      trackBgHex: trackBg.value,
      trackBgOpacityPct: Number(trackBgOp.value),
      trackBorderHex: trackBorder.value,
      trackBorderOpacityPct: Number(trackBorderOp.value),
      dotStyle: dotStyle.value === 'outline' ? 'outline' : dotStyle.value === 'hollow' ? 'hollow' : 'solid',
      dotIdleBgHex: dotIdleBg.value,
      dotIdleBgOpacityPct: Number(dotIdleBgOp.value),
      dotIdleBorderHex: dotIdleBorder.value,
      dotIdleBorderOpacityPct: Number(dotIdleBorderOp.value),
      dotIdleBorderWidthPx: Number(dotIdleBorderW.value) / 10,
      dotActiveBgHex: dotActiveBg.value,
      dotActiveBgOpacityPct: Number(dotActiveBgOp.value),
      dotActiveBorderHex: dotActiveBorder.value,
      dotActiveBorderOpacityPct: Number(dotActiveBorderOp.value),
      dotActiveBorderWidthPx: Number(dotActiveBorderW.value) / 10,
    }) ?? defaultTopicNavAppearance()
  );
}

async function persistLocalePrefs(): Promise<void> {
  const raw: UiLangPref = prefFromSelect();
  await chrome.storage.sync.set({
    [STORAGE_TOPIC_NAV_UI]: { v: 1, langPref: raw } satisfies { v: 1; langPref: UiLangPref },
  });
  applyChromeStrings(langForChrome());
}

function syncSliderLabels(): void {
  applyChromeStrings(langForChrome());
}

function scheduleLivePreviewFlush(): void {
  if (!chrome.storage.session?.set) return;
  if (previewDebounceTimer !== undefined) window.clearTimeout(previewDebounceTimer);
  previewDebounceTimer = window.setTimeout(() => {
    previewDebounceTimer = undefined;
    void (async () => {
      try {
        const payload = readFromForm();
        const ser = JSON.stringify(payload);
        if (ser === lastLivePreviewSerialized) return;
        lastLivePreviewSerialized = ser;
        await chrome.storage.session.set({
          [STORAGE_TOPIC_NAV_APPEARANCE_LIVE_PREVIEW]: payload,
        });
      } catch {
        /* ignore */
      }
    })();
  }, 50);
}

/** Capsule/dot controls: update labels + push session preview */
function onAppearanceFieldInput(): void {
  syncSliderLabels();
  scheduleLivePreviewFlush();
}

const appearanceSliders: HTMLInputElement[] = [
  shellWidth,
  trackBgOp,
  trackBorderOp,
  dotIdleBgOp,
  dotIdleBorderOp,
  dotIdleBorderW,
  dotActiveBgOp,
  dotActiveBorderOp,
  dotActiveBorderW,
];

const appearanceColorPickers: HTMLInputElement[] = [
  trackBg,
  trackBorder,
  dotIdleBg,
  dotIdleBorder,
  dotActiveBg,
  dotActiveBorder,
];

appearanceSliders.forEach((el) => el.addEventListener('input', onAppearanceFieldInput));
appearanceColorPickers.forEach((el) => el.addEventListener('input', onAppearanceFieldInput));

dotStyle.addEventListener('change', onAppearanceFieldInput);

localePref.addEventListener('change', () => void persistLocalePrefs());

window.addEventListener('pagehide', (ev: PageTransitionEvent) => {
  if (ev.persisted) return;
  void clearLivePreviewLocal();
});

async function load(): Promise<void> {
  await clearLivePreviewLocal();
  const bag = await chrome.storage.sync.get([STORAGE_TOPIC_NAV_APPEARANCE, STORAGE_TOPIC_NAV_UI]);
  const rawUi = bag[STORAGE_TOPIC_NAV_UI as keyof typeof bag];
  const ui = parseTopicNavUiStored(rawUi) ?? defaultUiPrefs();
  localePref.value = ui.langPref;

  const raw = bag[STORAGE_TOPIC_NAV_APPEARANCE as keyof typeof bag];
  const parsed = parseTopicNavAppearance(raw);
  hydrate(parsed ?? defaultTopicNavAppearance());
  bumpSerializedBaseline();
}

saveBtn.addEventListener('click', async () => {
  status.textContent = '';
  const next = readFromForm();
  await chrome.storage.sync.set({
    [STORAGE_TOPIC_NAV_APPEARANCE]: next,
    [STORAGE_TOPIC_NAV_UI]: { v: 1, langPref: prefFromSelect() },
  });
  await clearLivePreviewLocal();
  lastLivePreviewSerialized = JSON.stringify(next);
  applyChromeStrings(langForChrome());
  status.textContent = ux(langForChrome(), 'savedStatus');
});

resetBtn.addEventListener('click', async () => {
  status.textContent = '';
  await clearLivePreviewLocal();
  await chrome.storage.sync.remove(STORAGE_TOPIC_NAV_APPEARANCE as unknown as string);
  hydrate(defaultTopicNavAppearance());
  bumpSerializedBaseline();
  status.textContent = ux(langForChrome(), 'resetStatus');
});

openOpts.addEventListener('click', () => chrome.runtime.openOptionsPage());

void load();
