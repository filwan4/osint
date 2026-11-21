# Fieldwork

Fieldwork is a modular desktop workspace for open-source research and analysis, built with Rust and Tauri 2.

The repository is at foundation stage (v0.1.0): desktop shell, Rust workspace, local domain validation, CI, and signed-update release scaffolding.

## Scope

- Public domain and network metadata.
- GEOINT using public geographic datasets and maps.
- Public media and RSS monitoring.
- Document analysis for files the operator is authorized to inspect.
- Evidence provenance, timestamps, and confidence labels.
- Organization, infrastructure, place, and event relationship analysis.
- Reproducible reports with source references.

Fieldwork is not designed to identify, profile, or track private individuals. Collectors must respect source terms, privacy, rate limits, and applicable law. Findings must distinguish verified facts from hypotheses.

## Layout

- `apps/desktop`: Tauri 2 + React desktop application.
- `crates/fieldwork-core`: shared investigation and evidence models.
- `crates/fieldwork-infrastructure`: domain validation and public-infrastructure primitives.
- `.github/workflows`: CI and signed release automation.
- `docs`: architecture notes.

## Prerequisites

- Rust stable with Rust 2024 edition support.
- Node.js 22+ and npm.
- Tauri 2 platform prerequisites: https://v2.tauri.app/start/prerequisites/

## Run locally

```bash
cd apps/desktop
npm install
npm run tauri dev
```

From the repository root:

```bash
cargo fmt --all -- --check
cargo test -p fieldwork-core -p fieldwork-infrastructure
```

## Signed updates

The desktop app uses the official Tauri updater. Updates are distributed through GitHub Releases and verified against the public key embedded in the application.

Before the first release:
1. Generate a keypair locally: `npm run tauri signer generate -- -w ~/.tauri/fieldwork.key`.
2. Store the private key as GitHub Actions secret `TAURI_SIGNING_PRIVATE_KEY`.
3. Store its password as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` if one was set.
4. Replace the public-key placeholder in `apps/desktop/src-tauri/tauri.conf.json` with the contents of the generated public key file.
5. Commit the public key and push a tag such as `v0.1.0`.

Never commit the private signing key or password. The updater cannot validate releases until the public key is configured. Releases are created as drafts for review.

## Status

- [x] Rust workspace and shared evidence models
- [x] Tauri 2 desktop shell
- [x] Local domain validation
- [x] CI and release workflow scaffolding
- [ ] First live public-source collector
- [ ] Persistent investigation storage
- [ ] Evidence graph and report export

## License

No license has been selected. Public visibility does not automatically grant reuse rights.
