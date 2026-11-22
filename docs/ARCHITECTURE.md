# Architecture

## Principles

1. **Source provenance first** — every evidence record retains its source, retrieval time, collection method, and confidence.
2. **Modular collectors** — network access belongs in explicit Rust modules, not arbitrary frontend scripts.
3. **Typed boundaries** — frontend/backend messages use serializable request and response types.
4. **Privacy-aware scope** — prioritize public infrastructure, organizations, places, events, media, and authorized documents; do not build private-person profiling or tracking workflows.
5. **Safe networking** — future collectors must use HTTPS where available, apply timeouts and rate limits, validate redirects and response sizes, and never execute downloaded content.

## Layers

- `fieldwork-core`: shared investigation, evidence, entity, and provenance types.
- `fieldwork-infrastructure`: domain validation and future public-infrastructure collectors.
- `apps/desktop/src-tauri`: Tauri commands and native plugin registration.
- `apps/desktop/src`: desktop interface and local workspace workflows.
- `.github/workflows`: CI and Linux AppImage release automation.

## Current implementation

Version 0.2.0 includes:
- Local investigation records with source-backed evidence and confidence labels.
- Local entity and manually curated relationship registers.
- Coordinate validation and OpenStreetMap deep links.
- RSS/Atom source registration (not feed retrieval).
- Local text-file preview and basic text statistics for TXT, Markdown, CSV, and LOG files.
- Markdown/JSON investigation export and JSON workspace backup/restore.
- Local browser storage inside the desktop WebView.

## Data and trust boundaries

Workspace data is local to the app's WebView storage, not encrypted, and not synchronized. Users should export backups and avoid storing secrets or sensitive personal data.

The current build does not perform background network collection. Live DNS/RDAP, RSS retrieval, PDF/DOCX parsing, OCR, automated entity extraction, interactive graph visualization, and signed in-app updates remain future work. Future collectors must make their network activity explicit and preserve source provenance.
