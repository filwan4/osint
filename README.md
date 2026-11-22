# Fieldwork

Fieldwork is a modular desktop workspace for open-source research and analysis, built with Rust and Tauri 2.

Version 0.2.0 adds local investigation management, source-backed evidence records, entity and relationship registers, coordinate handling, text-file inspection, RSS source registration, and report/backup export. It is a local research workspace, not yet a fully automated OSINT collection suite.

## Install on CachyOS / Arch Linux

The current release target is Linux x86_64.

The installer downloads the latest published AppImage from GitHub Releases, checks and installs the required runtime packages with pacman, verifies the artifact's SHA-256 digest, installs the app under `~/.local/opt/fieldwork`, and creates a standard XDG desktop entry plus a command-line launcher.

```bash
curl -fL https://raw.githubusercontent.com/filwan4/osint/main/scripts/install-cachyos.sh \
  -o /tmp/fieldwork-install.sh
bash /tmp/fieldwork-install.sh
```

Launch Fieldwork from an application menu that indexes XDG desktop entries, or run:

```bash
~/.local/bin/fieldwork
```

To update Fieldwork, run the same installer command again. It verifies the downloaded artifact and replaces the existing AppImage only after the verification succeeds.

The installer supports CachyOS and Arch Linux on x86_64. Run it as your normal desktop user, not with sudo.

## Current modules

- **Investigations:** local workspaces, summaries, evidence records, confidence ratings, source URLs, and timestamps.
- **Infrastructure:** local DNS hostname syntax validation and a place to organize public network observations.
- **GEOINT:** latitude/longitude validation, local place records, and OpenStreetMap links.
- **Media intelligence:** RSS/Atom source URL register.
- **Document analysis:** local text extraction and basic statistics for TXT, Markdown, CSV, and LOG files up to 2 MB.
- **Entity analysis:** records for public organizations, places, events, datasets, and infrastructure.
- **Relationship graph:** manual links between registered entities.
- **Reports & export:** Markdown/JSON investigation exports and full-workspace JSON backup/restore.
- **Settings:** local data controls and application information.

## Current limitations

This release does not yet include live DNS/RDAP/certificate-transparency collectors, RSS fetching, media timeline aggregation, PDF/DOCX parsing, OCR, automatic entity extraction, an interactive graph visualization, or signed in-app updates. The UI labels and documentation must not be interpreted as claims that these collectors are active.

Workspace data is stored in the desktop app's local WebView storage. It is not encrypted or synchronized. Export backups regularly. Do not store passwords, access tokens, or sensitive personal information.

## Scope and safety

Fieldwork focuses on public infrastructure, organizations, places, events, public media, public datasets, and documents the operator is authorized to inspect. It is not designed to identify, profile, or track private individuals. Respect source terms, privacy, rate limits, and applicable law. Keep verified facts separate from hypotheses.

## Layout

- `apps/desktop`: Tauri 2 + React desktop application.
- `crates/fieldwork-core`: shared investigation and evidence models.
- `crates/fieldwork-infrastructure`: domain validation and public-infrastructure primitives.
- `.github/workflows`: CI and Linux release automation.
- `scripts`: icon generation, version verification, and CachyOS installer.
- `docs`: architecture notes.

## Development

### Prerequisites

- Rust stable with Rust 2024 edition support.
- Node.js 22+ and npm.
- Tauri Linux dependencies. On Arch/CachyOS:

```bash
sudo pacman -S --needed \
  webkit2gtk-4.1 base-devel curl wget file openssl \
  appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
```

### Run locally

```bash
cd apps/desktop
npm install
npm run tauri dev
```

From the repository root:

```bash
node scripts/check-version.mjs
cargo fmt --all -- --check
cargo test -p fieldwork-core -p fieldwork-infrastructure
cargo check -p fieldwork-desktop
```

### Creating a release

Keep the version in `Cargo.toml`, `apps/desktop/package.json`, and `apps/desktop/src-tauri/tauri.conf.json` in sync. Verify and tag the matching version:

```bash
node scripts/check-version.mjs
git tag -a v0.2.0 -m "Fieldwork v0.2.0"
git push origin v0.2.0
```

GitHub Actions builds the frontend and Rust application on Ubuntu 22.04 and publishes the AppImage to GitHub Releases.

## Updates

Updates are currently installed manually by running the CachyOS installer again. Signed in-app updates are not enabled.

## License

No license has been selected. Public visibility does not automatically grant reuse rights.
