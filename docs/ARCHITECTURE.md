# Architecture

## Principles

1. **Source provenance first** — every collected record retains its source, retrieval time, and collection method.
2. **Modular collectors** — network access belongs in explicit Rust modules, not arbitrary frontend scripts.
3. **Typed boundaries** — frontend/backend messages use serializable request and response types.
4. **Privacy-aware scope** — prioritize public infrastructure, organizations, places, events, media, and authorized documents; do not build private-person profiling or tracking workflows.
5. **Safe networking** — collectors must use HTTPS where available, apply timeouts and rate limits, validate redirects and response sizes, and never execute downloaded content.

## Layers

- `fieldwork-core`: shared investigation, evidence, and provenance types.
- `fieldwork-infrastructure`: domain validation and public infrastructure collectors.
- `apps/desktop/src-tauri`: Tauri commands and native plugin registration.
- `apps/desktop/src`: desktop interface.
- `.github/workflows`: CI and signed release automation.

## Update trust model

The Tauri updater verifies signed update artifacts using the public key embedded in the application. The private signing key is stored only in GitHub Actions secrets and must never enter the repository. A release remains a draft until a maintainer reviews and publishes it.

## Initial implementation boundary

Version 0.1.0 contains a desktop shell and local DNS-domain validation. It does not yet perform network collection or persist investigations.
