# Architecture

## Principles

1. **Source provenance first** — every collected record retains its source, retrieval time, and collection method.
2. **Modular collectors** — network access belongs in explicit Rust modules, not arbitrary frontend scripts.
3. **Typed boundaries** — frontend/backend messages use serializable request and response types.
4. **Privacy-aware scope** — prioritize public infrastructure, organizations, places, events, media, and authorized documents; do not build private-person profiling or tracking workflows.
5. **Safe networking** — collectors must use HTTPS where available, apply timeouts and rate limits, validate redirects and response sizes, and never execute downloaded content.

## Layers

- `fieldwork-core`: shared investigation, evidence, and provenance types.
- `fieldwork-infrastructure`: domain validation and public-infrastructure collectors.
- `apps/desktop/src-tauri`: Tauri commands and native plugin registration.
- `apps/desktop/src`: desktop interface.
- `.github/workflows`: CI and Linux AppImage release automation.

## Update trust model

The current release process uses GitHub Releases and a standard AppImage installer. The installer downloads the published artifact over HTTPS. Signed in-app updates are not enabled in the current foundation release.

## Initial implementation boundary

Version 0.1.2 contains a desktop shell and local ASCII DNS-name validation. It does not yet perform network collection or persist investigations.
