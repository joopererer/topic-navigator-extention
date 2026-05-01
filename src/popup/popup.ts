import type { TopicNavAppearanceStored } from '../core/appearance.js';
import {
  STORAGE_TOPIC_NAV_APPEARANCE,
  defaultTopicNavAppearance,
  parseTopicNavAppearance,
} from '../core/appearance.js';
import {
  STORAGE_TOPIC_NAV_APPEARANCE_PRESETS,
  defaultAppearancePresets,
  parseAppearancePresets,
  setPresetSlot,
} from '../core/appearancePresets.js';
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

const loadDefaultPreset = getEl('loadDefaultPreset') as HTMLButtonElement;
const loadPreset1 = getEl('loadPreset1') as HTMLButtonElement;
const loadPreset2 = getEl('loadPreset2') as HTMLButtonElement;
const loadPreset3 = getEl('loadPreset3') as HTMLButtonElement;
const savePreset1 = getEl('savePreset1') as HTMLButtonElement;
const savePreset2 = getEl('savePreset2') as HTMLButtonElement;
const savePreset3 = getEl('savePreset3') as HTMLButtonElement;

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
const lblPresets = getEl('_lblPresets');
const slot1Label = getEl('_slot1Label');
const slot2Label = getEl('_slot2Label');
const slot3Label = getEl('_slot3Label');

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

  lblPresets.textContent = ux(lang, 'presetSectionTitle');
  loadDefaultPreset.textContent = ux(lang, 'btnLoadDefault');
  slot1Label.textContent = ux(lang, 'presetSlotLabel', { n: 1 });
  slot2Label.textContent = ux(lang, 'presetSlotLabel', { n: 2 });
  slot3Label.textContent = ux(lang, 'presetSlotLabel', { n: 3 });
  loadPreset1.textContent = ux(lang, 'btnLoadPreset', { n: 1 });
  loadPreset2.textContent = ux(lang, 'btnLoadPreset', { n: 2 });
  loadPreset3.textContent = ux(lang, 'btnLoadPreset', { n: 3 });
  savePreset1.textContent = ux(lang, 'btnSaveToPreset', { n: 1 });
  savePreset2.textContent = ux(lang, 'btnSaveToPreset', { n: 2 });
  savePreset3.textContent = ux(lang, 'btnSaveToPreset', { n: 3 });

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

function onAppearanceFieldInput(): void {
  syncSliderLabels();
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

async function readPresetsBag(): Promise<ReturnType<typeof defaultAppearancePresets>> {
  const bag = await chrome.storage.sync.get(STORAGE_TOPIC_NAV_APPEARANCE_PRESETS);
  const raw = bag[STORAGE_TOPIC_NAV_APPEARANCE_PRESETS as keyof typeof bag];
  return parseAppearancePresets(raw) ?? defaultAppearancePresets();
}

async function load(): Promise<void> {
  const bag = await chrome.storage.sync.get([STORAGE_TOPIC_NAV_APPEARANCE, STORAGE_TOPIC_NAV_UI]);
  const rawUi = bag[STORAGE_TOPIC_NAV_UI as keyof typeof bag];
  const ui = parseTopicNavUiStored(rawUi) ?? defaultUiPrefs();
  localePref.value = ui.langPref;

  const raw = bag[STORAGE_TOPIC_NAV_APPEARANCE as keyof typeof bag];
  const parsed = parseTopicNavAppearance(raw);
  hydrate(parsed ?? defaultTopicNavAppearance());
}

loadDefaultPreset.addEventListener('click', () => {
  status.textContent = '';
  hydrate(defaultTopicNavAppearance());
  status.textContent = ux(langForChrome(), 'presetLoadedDefault');
});

function wirePresetSlot(
  index: 0 | 1 | 2,
  loadBtn: HTMLButtonElement,
  saveBtn: HTMLButtonElement,
): void {
  loadBtn.addEventListener('click', async () => {
    status.textContent = '';
    const presets = await readPresetsBag();
    const slot = presets.slots[index];
    if (!slot) {
      status.textContent = ux(langForChrome(), 'presetEmpty', { n: index + 1 });
      return;
    }
    const parsed = parseTopicNavAppearance(slot);
    hydrate(parsed ?? defaultTopicNavAppearance());
    status.textContent = ux(langForChrome(), 'presetLoaded', { n: index + 1 });
  });

  saveBtn.addEventListener('click', async () => {
    status.textContent = '';
    const cur = await readPresetsBag();
    const next = setPresetSlot(cur, index, readFromForm());
    await chrome.storage.sync.set({ [STORAGE_TOPIC_NAV_APPEARANCE_PRESETS]: next });
    status.textContent = ux(langForChrome(), 'presetSaved', { n: index + 1 });
  });
}

wirePresetSlot(0, loadPreset1, savePreset1);
wirePresetSlot(1, loadPreset2, savePreset2);
wirePresetSlot(2, loadPreset3, savePreset3);

saveBtn.addEventListener('click', async () => {
  status.textContent = '';
  const next = readFromForm();
  await chrome.storage.sync.set({
    [STORAGE_TOPIC_NAV_APPEARANCE]: next,
    [STORAGE_TOPIC_NAV_UI]: { v: 1, langPref: prefFromSelect() },
  });
  applyChromeStrings(langForChrome());
  status.textContent = ux(langForChrome(), 'savedStatus');
});

resetBtn.addEventListener('click', async () => {
  status.textContent = '';
  await chrome.storage.sync.remove(STORAGE_TOPIC_NAV_APPEARANCE as unknown as string);
  hydrate(defaultTopicNavAppearance());
  status.textContent = ux(langForChrome(), 'resetStatus');
});

openOpts.addEventListener('click', () => chrome.runtime.openOptionsPage());

void load();
