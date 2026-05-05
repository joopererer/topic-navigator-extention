# Changelog

All notable changes to this project are documented in this file by release version.

## 1.0.2

- **Popup / theming**: Grouped controls into compact sections (track, dot shape, inactive, active), removed the subtitle line to shorten the panel, and dropped the explicit “save” step in favour of debounced autosave plus a flush when the popup closes.
- **Per-section reset**: “Reset” restores defaults for track, inactive dots, or active dot only; full “reset defaults” still clears all custom appearance.
- **Firefox**: Appearance colors use hex input and preset swatches instead of `<input type="color">`, avoiding the toolbar popup closing when the system color picker opens.
- **Privacy / packaging**: Narrower optional host permissions (`https://*/*` plus localhost HTTP only); README updates for stored data and privacy.
- **Toolbar**: Action tooltip shortened to “Topic Navigator”.

## 1.0.1

- Packaging and versioning alignment; extension icons pipeline; assorted fixes and UX around Onyx, chat font scaling, and Claude selectors (see git history for detail).
