# Topic Navigator

<p align="center">
  <strong>English</strong>
  &nbsp;·&nbsp;
  <a href="./README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/joopererer/topic-navigator-extention/actions/workflows/ci.yml"><img src="https://github.com/joopererer/topic-navigator-extention/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI status" /></a>
  &nbsp;
  <a href="https://github.com/joopererer/topic-navigator-extention/releases"><img src="https://img.shields.io/github/v/release/joopererer/topic-navigator-extention?label=release" alt="Latest GitHub release" /></a>
  &nbsp;
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/joopererer/topic-navigator-extention" alt="License" /></a>
  &nbsp;
  <a href="https://chromewebstore.google.com/detail/topic-navigator/beekbleccbdjfddegookdonfbnlbognc"><img src="https://img.shields.io/chrome-web-store/v/beekbleccbdjfddegookdonfbnlbognc?label=chrome&logo=googlechrome&logoColor=white" alt="Chrome Web Store version" /></a>
  &nbsp;
  <a href="https://addons.mozilla.org/addon/topic-navigator/"><img src="https://img.shields.io/amo/v/topic-navigator?label=firefox&logo=firefox-browser&logoColor=white" alt="Firefox add-on version" /></a>
  &nbsp;
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Manifest-V3-blue" alt="Manifest V3" /></a>
</p>

A browser extension that adds a **turn-by-turn sidebar timeline** on ChatGPT, Gemini, Claude, Onyx (including self-hosted), and similar chat pages: jump between user/assistant turns, open an outline list with search, and customize the rail and dot colors from the toolbar popup.

---

## Features

### Turn navigation

- **Right-hand timeline (rail)**: Scrollable dots in conversation order; the turn in view highlights its dot.
- **Hover preview**: Hover a dot to see a short summary for that turn.
- **Click to jump**: Click a dot to scroll the page to the matching message.
- **Outline panel**: Use the floating button next to the rail to open the conversation outline side sheet.
- **Search**: Filter turns by keyword inside the panel (matches outline text).

### Appearance & language

- **Toolbar popup**: Change rail width, track fill/border, dot style (solid / hollow / outline), inactive/active colors and opacity. Settings are stored in `chrome.storage.sync` and apply to open tabs on the same sites.
- **Reset defaults**: Clear custom theme and restore the built-in default look.
- **UI language**: English, Chinese, or French, plus “Auto (follow system)”. Set it in the popup or the options page.

### Self-hosted Onyx (optional)

- Official Onyx hosts are matched out of the box. For your own domain, open the **options page**, enter [Chrome match patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns) (one per line), save, grant host permission when prompted—the extension registers the same content script on those URLs.

---

## Supported sites (built-in)

Content scripts run where `manifest.json` matches:

| Platform | Hosts |
|----------|--------|
| ChatGPT | `chatgpt.com`, `chat.openai.com` |
| Gemini | `gemini.google.com`, `business.gemini.google` |
| Google AI Studio | `aistudio.google.com`, `aistudio.google.cn` |
| Claude | `claude.ai` |
| Onyx (cloud) | `cloud.onyx.app` |

Other Onyx deployments use **custom patterns** on the options page. The extension declares `optional_host_permissions` (`https://*/*`, plus `http://localhost/*` and `http://127.0.0.1/*` only for local HTTP dev) so extra hosts are granted on demand.

---

## Install from stores

- **Chrome** (and other Chromium browsers): [Topic Navigator on the Chrome Web Store](https://chromewebstore.google.com/detail/topic-navigator/beekbleccbdjfddegookdonfbnlbognc). **Microsoft Edge** can install from the Chrome Web Store after enabling “Allow extensions from other stores” in `edge://extensions`.
- **Firefox**: [Topic Navigator on addons.mozilla.org](https://addons.mozilla.org/addon/topic-navigator/) — [English (US)](https://addons.mozilla.org/en-US/firefox/addon/topic-navigator/) · [简体中文](https://addons.mozilla.org/zh-CN/firefox/addon/topic-navigator/). The listing may also show [Firefox for Android](https://www.mozilla.org/firefox/mobile/) when supported.

## Install (load unpacked)

1. Clone the repo and run:
   ```bash
   npm install
   npm run build
   ```
2. **Chromium (Chrome, Edge, Brave, …)** → `chrome://extensions` or `edge://extensions` → enable **Developer mode** → **Load unpacked** → select the **`dist`** folder (not the repo root).
3. Open a supported chat page and refresh; the rail should appear on the right.

### Firefox

Firefox rejects MV3 `background.service_worker` in many setups; use a separate output folder:

```bash
npm run build:firefox
```

Then **Firefox** → `about:debugging` → **This Firefox** → **Load Temporary Add-on…** → choose **`dist-firefox/manifest.json`**.

Each `npm run build:firefox` runs a full build, then copies `dist/` → `dist-firefox/` and patches the manifest (`background.scripts` + `browser_specific_settings.gecko`). Chat font scaling uses CSS `zoom`; if it behaves oddly on Firefox, report an issue—`transform`/`font-size` fallbacks can be added per site.

For development you can watch the content bundle:

```bash
npm run dev
```

Run a full `npm run build` when you need updated popup, background, or options bundles.

Toolbar / extension icons come from **`icons/source.png`**; `npm run build` regenerates **`icons/icon{16,32,48,128}.png`** (via `sharp`) before packaging. Replace `source.png`, then rebuild.

### GitHub Release zips (Chrome / Edge / Firefox)

- **CI**: Push a **version tag** matching `v*` (e.g. `v1.0.0`). The [Release workflow](.github/workflows/release.yml) runs `npm run build:firefox`, then uploads:
  - `topic-navigator-chromium-<tag>.zip` — unpack; use the **folder** with **Load unpacked** in Chrome or Edge.
  - `topic-navigator-firefox-<tag>.zip` — same for Firefox **Temporary Add-on** → pick `manifest.json` inside the extracted folder (or keep as a single folder if you extract to a fixed path).
- **Local zips** (same layout as CI):

  ```bash
  npm run package:release
  ```

  Creates `topic-navigator-chromium-v<manifest-version>.zip` and `topic-navigator-firefox-v<manifest-version>.zip` in the repo root (gitignored). Bump `version` in `manifest.json` before tagging a release.

---

## Usage

1. **First run**: Open a supported chat page. If a site changes its DOM, you may need an extension update for selectors to keep working.
2. **Theming**: Click the extension icon → adjust controls; appearance autosaves after a short debounce (and again when you close the popup). Open tabs pick up changes via storage sync.
3. **Self-hosted Onyx**: Extension menu → **Options** (or use the link in the popup) → enter URL match patterns → save and approve permissions.
4. **Color presets (optional)**: The code supports three preset slots plus “load default”; the preset block in the popup is **hidden** by default. To show it, change `#presetSection` in `popup.html` from `display: none` to `display: grid` (see comment in that file).

---

## Permissions

### Data stored

This extension stores only:

- custom Onyx host match patterns
- UI language preference
- appearance settings (and optional saved color preset slots, if you enable that UI)
- chat font scale

Preferences are kept in **`chrome.storage.sync`** (Chromium/Firefox WebExtension storage labelled “sync”), so they may sync with your browser profile when you are signed in. **No conversation content is intentionally uploaded to external servers.**

### Privacy

- No analytics
- No remote telemetry
- No external API calls from this extension codebase
- Preferences only stored in browser extension storage
- No conversation data intentionally transmitted off-device

| Permission | Why |
|------------|-----|
| `storage` | UI language, appearance, and Onyx pattern list (`chrome.storage.sync`). |
| `scripting` | Register/unregister content scripts for custom hosts from the options page. |
| Host access | Inject only on matched chat origins (and hosts you approve); used to index turns locally—**no** uploading conversation text to third-party servers.

---

## Development & tests

```bash
npm run build   # TypeScript check + bundle content / background / popup / options
npm run test    # Vitest
```

Push and pull requests to `master` run the same **`build` + `test`** steps via [GitHub Actions](https://github.com/joopererer/topic-navigator-extention/actions). Version tags `v*` also run tests before building Release zips.

---

## License

This project is licensed under the **[MIT License](./LICENSE)**.
