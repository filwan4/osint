# Changelog

All notable changes to Fieldwork are documented here.

## [0.1.2] - Unreleased

### Improved
- Refreshed the desktop interface with clearer hierarchy, more consistent spacing, and responsive layouts.
- Made the displayed application version follow package metadata.
- Improved domain-validation feedback, pending state, keyboard submission, and accessibility labels.
- Expanded domain validation tests and clarified the ASCII/Punycode requirement.
- Updated CachyOS installer output and project documentation.

### Fixed
- Reject DNS names containing repeated trailing dots.
- Clear stale validation results when the input changes.
- Correct outdated version, launcher, and updater references in the interface and documentation.
- Lower the minimum desktop window size to match the responsive layout.

## [0.1.1] - 2026-11-22

### Fixed
- Removed the unconfigured Tauri updater plugin that prevented the desktop app from starting.

## [0.1.0] - 2026-11-22

### Added
- Initial Rust workspace and shared evidence models.
- Tauri 2 + React desktop shell with dark interface.
- Local DNS-domain validation command.
- GitHub Actions CI and Linux AppImage release automation.
- Architecture and development documentation.

### Not yet available
- Live collectors, investigation storage, graph analysis, and report export.
