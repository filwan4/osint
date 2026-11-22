# Fieldwork

Fieldwork is a modular desktop workspace for open-source research and analysis, built with Rust and Tauri 2.

The repository is at foundation stage (v0.1.0): desktop shell, Rust workspace, local domain validation, CI, and Linux distribution automation.

## Install on CachyOS / Arch Linux

The first release target is Linux x86_64.

The installer downloads the latest published AppImage from GitHub Releases, checks and installs the required runtime packages with pacman, installs the app under `~/.local/opt/fieldwork`, and creates a desktop entry plus a launcher for Rofi and other application menus.

```bash
curl -fL https://raw.githubusercontent.com/filwan4/osint/main/scripts/install-cachyos.sh \
  -o /tmp/fieldwork-install.sh
bash /tmp/fieldwork-install.sh
```

After installation, open Rofi and search for **Fieldwork**, or run:

```bash
fieldwork
```

To update Fieldwork, run the same installer command again. It replaces the existing AppImage with the latest published version and keeps the launcher in place.

The installer supports CachyOS and Arch Linux on x86_64. It uses pacman to ensure the WebKitGTK and desktop runtime dependencies are present. It does not install development tools or compile the application.

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
- `.github/workflows`: CI and release automation.
- `scripts`: icon generation and CachyOS installer.
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

The Tauri npm pre-hook generates the PNG app icon from the tracked SVG before dev and release builds. It uses `rsvg-convert` or ImageMagick.

From the repository root:

```bash
cargo fmt --all -- --check
cargo test -p fieldwork-core -p fieldwork-infrastructure
```

## Releases

Push a version tag matching the Tauri app version to build and publish a Linux x86_64 AppImage:

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions builds the frontend and Rust application on Ubuntu 22.04 and publishes the AppImage to GitHub Releases. Ubuntu 22.04 is used as a conservative Linux build baseline for glibc compatibility.

## Updates

For now, updates are installed by running the CachyOS installer again. The Tauri updater plugin remains available in the project, but signed in-app updates are not enabled until a signing keypair is generated and the private key is stored as GitHub Actions secrets. Never commit or share the private signing key.

## Status

- [x] Rust workspace and shared evidence models
- [x] Tauri 2 desktop shell
- [x] Local domain validation
- [x] CI and Linux AppImage release workflow
- [x] CachyOS installer and desktop launcher
- [ ] First live public-source collector
- [ ] Persistent investigation storage
- [ ] Evidence graph and report export
- [ ] Signed in-app updates

## License

No license has been selected. Public visibility does not automatically grant reuse rights.
