# Changelog

All notable changes to Fieldwork are documented here.

## [0.2.0] - 2026-11-22

### Added
- Local investigation workspaces with evidence records, source references, timestamps, and confidence ratings.
- Public infrastructure workspace with local DNS hostname validation.
- GEOINT coordinate register with OpenStreetMap links.
- RSS/Atom source register.
- Local text-file inspection for TXT, Markdown, CSV, and LOG files (2 MB limit).
- Entity register for organizations, public places, events, and infrastructure.
- Manual relationship register between public entities.
- Markdown and JSON investigation exports plus full-workspace JSON backup and restore.
- Settings page with local-data controls and application information.
- Persistent local workspace storage in the desktop app.

### Improved
- Replaced the foundation-only overview with functional module navigation and dedicated workspaces.
- Added clearer status messages, empty states, and source-management workflows.
- Documented the current implementation boundaries and privacy model.

### Limitations
- RSS retrieval, live DNS/RDAP lookups, automated media timelines, PDF/DOCX parsing, OCR, automatic entity extraction, graph visualization, and signed in-app updates are not enabled yet.
- Workspace data is stored locally in the app's WebView storage and is not encrypted. Export backups regularly and do not store secrets or sensitive personal information.

## [0.1.2] - 2026-11-22

### Improved
- Refreshed the desktop interface with clearer hierarchy, more consistent spacing, and responsive layouts.
- Made the displayed application version follow package metadata.
- Improved domain-validation feedback, pending state, keyboard submission, and accessibility labels.
- Prevented stale validation results while a request is in progress and made whitespace-only input errors explicit.
- Improved small-text readability across the desktop interface.
- Added AppImage SHA-256 verification and atomic installation to the CachyOS installer.
- Expanded CI to compile the complete Tauri desktop application and check release-version consistency.
- Expanded domain validation tests and clarified the ASCII/Punycode requirement.
- Updated CachyOS installer output and project documentation.

### Fixed
- Reject DNS names containing repeated trailing dots.
- Clear stale validation results when the input changes.
- Correct outdated version, launcher, and updater references in the interface and documentation.
- Lower the minimum desktop window size to match the responsive layout.
- Remove the unused process plugin and its unnecessary permissions.

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
