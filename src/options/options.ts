import { STORAGE_CUSTOM_ONYX } from '../core/types.js';
import { patternsToOriginPermissions } from '../util/matchPatterns.js';

const ta = document.getElementById('patterns') as HTMLTextAreaElement;
const saveBtn = document.getElementById('save') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLParagraphElement;

function linesFromTextarea(): string[] {
  return ta.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

async function load(): Promise<void> {
  const res = await chrome.storage.sync.get(STORAGE_CUSTOM_ONYX);
  const cur = res[STORAGE_CUSTOM_ONYX];
  ta.value = Array.isArray(cur) ? (cur as string[]).join('\n') : '';
}

async function save(): Promise<void> {
  status.textContent = '';
  const patterns = linesFromTextarea();
  const origins = patternsToOriginPermissions(patterns);

  if (origins.length) {
    const ok = await chrome.permissions.request({ origins });
    if (!ok) {
      status.textContent = 'Host permission was not granted; patterns were not saved.';
      return;
    }
  }

  await chrome.storage.sync.set({ [STORAGE_CUSTOM_ONYX]: patterns });
  status.textContent = 'Saved. Reload Onyx tabs (or wait for auto re-inject on next navigation).';
}

void load();
saveBtn.addEventListener('click', () => void save());
