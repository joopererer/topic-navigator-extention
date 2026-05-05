import type { UiLangCode } from './uiPrefs.js';

export const UI = {
  /** In-page chrome (content script) */
  searchTurnsPlaceholder: { en: 'Search turns…', zh: '搜索轮次…', fr: 'Rechercher des tours…' },
  searchTurnsAria: { en: 'Filter turns', zh: '筛选轮次', fr: 'Filtrer les tours' },
  outlineDialogAria: { en: 'Conversation outline', zh: '会话大纲', fr: 'Plan de la conversation' },
  fabOpenList: { en: 'Open turn list', zh: '打开轮次列表', fr: 'Ouvrir la liste des tours' },
  fabCloseList: { en: 'Close turn list', zh: '关闭轮次列表', fr: 'Fermer la liste des tours' },
  fabFontIncrease: {
    en: 'Increase chat font size',
    zh: '增大对话区字体',
    fr: 'Agrandir la police du chat',
  },
  fabFontDecrease: {
    en: 'Decrease chat font size',
    zh: '减小对话区字体',
    fr: 'Réduire la police du chat',
  },
  fabFontScaleResetTitle: {
    en: 'Click to restore default size (100%)',
    zh: '点击恢复默认大小（100%）',
    fr: 'Clic pour la taille par défaut (100 %)',
  },
  fabFontScaleToastAria: {
    en: 'Chat font scale {pct}% of default',
    zh: '对话字体为默认的 {pct}%',
    fr: 'Police du chat à {pct} % du défaut',
  },
  turnAria: { en: 'Turn {n}', zh: '第 {n} 轮', fr: 'Tour {n}' },
  turnAriaWithPreview: { en: 'Turn {n}: {preview}', zh: '第 {n} 轮：{preview}', fr: 'Tour {n} : {preview}' },
  outlineRowAria: { en: 'Turn {n}: {text}', zh: '第 {n} 轮：{text}', fr: 'Tour {n} : {text}' },
  turnFallback: { en: 'Turn {n}', zh: '第 {n} 轮', fr: 'Tour {n}' },

  /** Popup */
  popupTitle: { en: 'Topic Navigator', zh: 'Topic Navigator', fr: 'Topic Navigator' },
  popupSubtitle: {
    en: 'Capsule and dots sync to open chat tabs.',
    zh: '时间轴胶囊与节点样式会同步到已打开的会话页。',
    fr: 'La capsule et les pastilles sont appliquées aux onglets de discussion ouverts.',
  },
  firefoxHexColorTitle: {
    en: 'Color as #rrggbb (Firefox: type or pick a swatch)',
    zh: '十六进制色值 #rrggbb（Firefox：输入或点色块）',
    fr: 'Couleur en #rrggbb (Firefox : saisie ou nuancier)',
  },
  localeLabel: {
    en: 'Language',
    zh: '界面语言',
    fr: "Langue de l'interface",
  },
  localeAuto: { en: 'Auto (follow system)', zh: '自动（跟随系统）', fr: 'Auto (suivre le système)' },
  localeEn: { en: 'English', zh: '英语', fr: 'English' },
  localeZh: { en: '中文', zh: '中文', fr: '中文 (Chinois)' },
  localeFr: { en: 'Français', zh: '法语', fr: 'Français' },
  capsuleWidth: { en: 'Capsule width × {w}', zh: '胶囊宽度 × {w}', fr: 'Largeur de la capsule × {w}' },
  trackBgOpacity: { en: 'Track fill · opacity {p}', zh: '胶囊底色 · 透明度 {p}', fr: 'Fond du rail · opacité {p}' },
  trackBorderOpacity: { en: 'Track border · opacity {p}', zh: '胶囊描边 · 透明度 {p}', fr: 'Bordure du rail · opacité {p}' },
  dotUnifiedStyle: {
    en: 'Dot shape (inactive + active)',
    zh: '时间点样式（未选与选中统一）',
    fr: 'Forme des pastilles (inactif + actif)',
  },
  dotStyleSolid: { en: 'Solid', zh: '实心', fr: 'Plein' },
  dotStyleHollow: { en: 'Hollow (border only)', zh: '空心（仅描边）', fr: 'Creux (bordure seule)' },
  dotStyleOutline: { en: 'Outline (emphasis)', zh: '描边（加粗）', fr: 'Contour (accent)' },
  dotInactiveBg: { en: 'Inactive · fill', zh: '未选中 · 底色', fr: 'Inactif · remplissage' },
  dotInactiveBgOpacity: { en: 'Inactive · fill opacity {p}', zh: '未选中 · 底色透明度 {p}', fr: 'Inactif · opacité du fond {p}' },
  dotInactiveBorder: { en: 'Inactive · border', zh: '未选中 · 描边色', fr: 'Inactif · bordure' },
  dotInactiveBorderOpacity: { en: 'Inactive · border opacity {p}', zh: '未选中 · 描边透明度 {p}', fr: 'Inactif · opacité bordure {p}' },
  dotInactiveBorderWidth: { en: 'Inactive · border width {w}', zh: '未选中 · 描边粗细 {w}', fr: 'Inactif · épaisseur bordure {w}' },
  dotActiveBg: { en: 'Active · fill', zh: '选中 · 底色', fr: 'Actif · remplissage' },
  dotActiveBgOpacity: { en: 'Active · fill opacity {p}', zh: '选中 · 底色透明度 {p}', fr: 'Actif · opacité du fond {p}' },
  dotActiveBorder: { en: 'Active · border', zh: '选中 · 描边色', fr: 'Actif · bordure' },
  dotActiveBorderOpacity: { en: 'Active · border opacity {p}', zh: '选中 · 描边透明度 {p}', fr: 'Actif · opacité bordure {p}' },
  dotActiveBorderWidth: { en: 'Active · border width {w}', zh: '选中 · 描边粗细 {w}', fr: 'Actif · épaisseur bordure {w}' },
  btnSave: { en: 'Save & apply', zh: '保存并应用', fr: 'Enregistrer' },
  btnReset: { en: 'Reset defaults', zh: '恢复默认', fr: 'Réinitialiser' },
  btnOptions: { en: 'Options · Onyx', zh: '选项页 · Onyx', fr: 'Options · Onyx' },
  savedStatus: {
    en: 'Saved. Open tabs update automatically.',
    zh: '已保存。已打开的标签会自动更新。',
    fr: 'Enregistré. Les onglets ouverts se mettent à jour.',
  },
  resetStatus: {
    en: 'Custom theme cleared; open tabs updated.',
    zh: '已清除自定义；已打开的标签已更新。',
    fr: 'Thème personnalisé effacé ; onglets mis à jour.',
  },

  presetSectionTitle: {
    en: 'Saved color schemes (3 slots)',
    zh: '配色预设（最多 3 个）',
    fr: 'Jeux de couleurs (3 emplacements)',
  },
  btnLoadDefault: {
    en: 'Load default',
    zh: '载入默认',
    fr: 'Défaut',
  },
  btnLoadPreset: { en: 'Load {n}', zh: '载入{n}', fr: 'Charger {n}' },
  btnSaveToPreset: { en: 'Save to {n}', zh: '保存到{n}', fr: 'Enreg. {n}' },
  presetSlotLabel: { en: 'Slot {n}', zh: '方案{n}', fr: '{n}' },
  presetSaved: {
    en: 'Saved to slot {n}.',
    zh: '已保存到方案{n}。',
    fr: 'Enregistré ({n}).',
  },
  presetLoaded: {
    en: 'Loaded slot {n}. Use Save & apply to update open tabs.',
    zh: '已载入方案{n}。保存并应用后可同步到页面。',
    fr: 'Emplacement {n} chargé. Enregistrez pour appliquer.',
  },
  presetEmpty: {
    en: 'Slot {n} is empty. Save the current form first.',
    zh: '方案{n}为空，请先将当前配色保存到该方案。',
    fr: 'Emplacement {n} vide.',
  },
  presetLoadedDefault: {
    en: 'Loaded built‑in default. Use Save & apply to update open tabs.',
    zh: '已载入内置默认配色。保存并应用后可同步到页面。',
    fr: 'Défaut chargé. Enregistrez pour appliquer.',
  },

  /** Options page */
  optionsTitle: { en: 'Topic Navigator', zh: 'Topic Navigator', fr: 'Topic Navigator' },
  optionsBrowserTitle: {
    en: 'Topic Navigator · Options',
    zh: 'Topic Navigator · 选项',
    fr: 'Topic Navigator · Options',
  },
  optionsOnyxIntro: {
    en: 'Self-hosted Onyx uses your own hostname. Enter Chrome',
    zh: '自托管 Onyx 使用你自己的域名。在此填写 Chrome',
    fr: 'Onyx auto-hébergé utilise votre propre hôte. Saisissez les',
  },
  optionsMatchPatternsLink: { en: 'match patterns', zh: '匹配模式', fr: "motifs d'URL" },
  optionsOnyxIntro2: {
    en: '(one per line). Saving asks for permission and registers the content script on those URLs.',
    zh: '（每行一条）。保存时会请求权限并在这些 URL 上注册内容脚本。',
    fr: "(un par ligne). L'enregistrement demande l'autorisation et enregistre le script sur ces URL.",
  },
  optionsPatternsLabel: { en: 'Onyx patterns', zh: 'Onyx 匹配模式', fr: 'Motifs Onyx' },
  optionsExamples: {
    en: 'Examples: https://company-onyx.app/chat* · http://127.0.0.1:3000/*',
    zh: '示例：https://company-onyx.app/chat* · http://127.0.0.1:3000/*',
    fr: 'Exemples : https://company-onyx.app/chat* · http://127.0.0.1:3000/*',
  },
  optionsSave: { en: 'Save & register', zh: '保存并注册', fr: 'Enregistrer' },
  optionsStatusDone: {
    en: 'Saved. Reload Onyx tabs (or wait for auto re-inject on next navigation).',
    zh: '已保存。重新加载 Onyx 标签页，或在下一次跳转时等待自动注入。',
    fr: 'Enregistré. Rechargez les onglets Onyx (ou réinjectez à la navigation).',
  },
  optionsStatusDenied: {
    en: 'Host permission was not granted; patterns were not saved.',
    zh: '未授予主机权限；未保存匹配模式。',
    fr: "Autorisation d'hôte refusée ; motifs non enregistrés.",
  },
  optionsLocaleHeading: {
    en: 'Interface language',
    zh: '界面语言',
    fr: "Langue de l'interface",
  },
  optionsPatternsPlaceholder: {
    en: 'https://onyx.internal.example.com/chat*',
    zh: 'https://onyx.example.com/chat*',
    fr: 'https://onyx.example.com/chat*',
  },
} as const satisfies Record<
  string,
  { en: string; zh: string; fr: string }
>;

export type UiStringKey = keyof typeof UI;

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function t(lang: UiLangCode, key: UiStringKey, vars?: Record<string, string | number>): string {
  const row = UI[key];
  const raw = row[lang] ?? row.en;
  return interpolate(raw, vars);
}
