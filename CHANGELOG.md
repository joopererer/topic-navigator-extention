# Changelog

All notable changes to this project are documented in this file by release version.

## 1.0.3

- **Scrolling (Chrome)**: More reliable jumps on Gemini and Claude by choosing the scroll ancestor with the largest vertical overflow, instead of the first nested scroller.
- **Popup (Chrome / Edge)**: Stopped whole-row `<label>` wrapping from forwarding clicks to the color input—tapping the field title or row padding no longer opens the native color picker by accident.
- **Firefox / AMO**: Desktop manifest keeps `data_collection_permissions`; removed it from `gecko_android` to avoid “unexpected property” warnings. Content UI uses DOM APIs instead of `innerHTML` for the outline panel and FAB icon where applicable.
- **Build**: Firefox package targets Gecko **140+** (desktop) and **142+** (Android) so `data_collection_permissions` matches AMO linter; `optional_host_permissions` remains valid.

## 1.0.2

- **Popup / theming**: Grouped controls into compact sections (track, dot shape, inactive, active), removed the subtitle line to shorten the panel, and dropped the explicit “save” step in favour of debounced autosave plus a flush when the popup closes.
- **Per-section reset**: “Reset” restores defaults for track, inactive dots, or active dot only; full “reset defaults” still clears all custom appearance.
- **Firefox**: Appearance colors use hex input and preset swatches instead of `<input type="color">`, avoiding the toolbar popup closing when the system color picker opens.
- **Privacy / packaging**: Narrower optional host permissions (`https://*/*` plus localhost HTTP only); README updates for stored data and privacy.
- **Toolbar**: Action tooltip shortened to “Topic Navigator”.

## 1.0.1

- Packaging and versioning alignment; extension icons pipeline; assorted fixes and UX around Onyx, chat font scaling, and Claude selectors (see git history for detail).
