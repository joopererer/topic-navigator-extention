import type { TopicNavAppearanceStored } from '../core/appearance.js';
import {
  STORAGE_TOPIC_NAV_APPEARANCE,
  defaultTopicNavAppearance,
  parseTopicNavAppearance,
} from '../core/appearance.js';

const shellWidth = document.getElementById('shellWidth') as HTMLInputElement;
const trackBg = document.getElementById('trackBg') as HTMLInputElement;
const trackBgOp = document.getElementById('trackBgOp') as HTMLInputElement;
const trackBorder = document.getElementById('trackBorder') as HTMLInputElement;
const trackBorderOp = document.getElementById('trackBorderOp') as HTMLInputElement;
const dotIdleBg = document.getElementById('dotIdleBg') as HTMLInputElement;
const dotIdleBorder = document.getElementById('dotIdleBorder') as HTMLInputElement;
const dotIdleBorderOp = document.getElementById('dotIdleBorderOp') as HTMLInputElement;
const dotActiveBg = document.getElementById('dotActiveBg') as HTMLInputElement;
const dotActiveBorder = document.getElementById('dotActiveBorder') as HTMLInputElement;
const dotStyle = document.getElementById('dotStyle') as HTMLSelectElement;
const saveBtn = document.getElementById('save') as HTMLButtonElement;
const resetBtn = document.getElementById('reset') as HTMLButtonElement;
const openOpts = document.getElementById('openOptions') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLParagraphElement;

const lblW = document.getElementById('lblW') as HTMLSpanElement;
const lblTrackOp = document.getElementById('lblTrackOp') as HTMLSpanElement;
const lblBdOp = document.getElementById('lblBdOp') as HTMLSpanElement;
const lblDotBdOp = document.getElementById('lblDotBdOp') as HTMLSpanElement;

function hydrate(a: TopicNavAppearanceStored): void {
  shellWidth.value = String(a.shellWidthPx);
  trackBg.value = a.trackBgHex;
  trackBgOp.value = String(a.trackBgOpacityPct);
  trackBorder.value = a.trackBorderHex;
  trackBorderOp.value = String(a.trackBorderOpacityPct);
  dotIdleBg.value = a.dotIdleBgHex;
  dotIdleBorder.value = a.dotIdleBorderHex;
  dotIdleBorderOp.value = String(a.dotIdleBorderOpacityPct);
  dotActiveBg.value = a.dotActiveBgHex;
  dotActiveBorder.value = a.dotActiveBorderHex;
  dotStyle.value = a.dotStyle;
  syncLabels();
}

function readFromForm(): TopicNavAppearanceStored {
  return (
    parseTopicNavAppearance({
      v: 1,
      shellWidthPx: Number(shellWidth.value),
      trackBgHex: trackBg.value,
      trackBgOpacityPct: Number(trackBgOp.value),
      trackBorderHex: trackBorder.value,
      trackBorderOpacityPct: Number(trackBorderOp.value),
      dotIdleBgHex: dotIdleBg.value,
      dotIdleBorderHex: dotIdleBorder.value,
      dotIdleBorderOpacityPct: Number(dotIdleBorderOp.value),
      dotActiveBgHex: dotActiveBg.value,
      dotActiveBorderHex: dotActiveBorder.value,
      dotStyle: dotStyle.value === 'outline' ? 'outline' : dotStyle.value === 'hollow' ? 'hollow' : 'solid',
    }) ?? defaultTopicNavAppearance()
  );
}

function syncLabels(): void {
  lblW.textContent = `${shellWidth.value}px`;
  lblTrackOp.textContent = `${trackBgOp.value}%`;
  lblBdOp.textContent = `${trackBorderOp.value}%`;
  lblDotBdOp.textContent = `${dotIdleBorderOp.value}%`;
}

shellWidth.addEventListener('input', syncLabels);
trackBgOp.addEventListener('input', syncLabels);
trackBorderOp.addEventListener('input', syncLabels);
dotIdleBorderOp.addEventListener('input', syncLabels);

async function load(): Promise<void> {
  const bag = await chrome.storage.sync.get(STORAGE_TOPIC_NAV_APPEARANCE);
  const raw = bag[STORAGE_TOPIC_NAV_APPEARANCE as keyof typeof bag];
  const parsed = parseTopicNavAppearance(raw);
  hydrate(parsed ?? defaultTopicNavAppearance());
}

saveBtn.addEventListener('click', async () => {
  status.textContent = '';
  const next = readFromForm();
  await chrome.storage.sync.set({
    [STORAGE_TOPIC_NAV_APPEARANCE]: next,
  });
  status.textContent = '已保存。已打开的标签会自动更新样式；否则切换一下对话即可。';
});

resetBtn.addEventListener('click', async () => {
  status.textContent = '';
  await chrome.storage.sync.remove(STORAGE_TOPIC_NAV_APPEARANCE as unknown as string);
  hydrate(defaultTopicNavAppearance());
  status.textContent = '已清除自定义并已同步到打开的会话标签。';
});

openOpts.addEventListener('click', () => chrome.runtime.openOptionsPage());

void load();
