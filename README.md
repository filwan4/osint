# Fieldwork

Fieldwork is a modular desktop workspace for open-source research and analysis, built with Rust and Tauri 2.

The project is in its foundation stage (v0.1.2): desktop shell, Rust workspace, local DNS-name validation, CI, and Linux distribution automation. Most research modules are planned and are not active collectors yet.

## Install on CachyOS / Arch Linux

The current release target is Linux x86_64.

The installer downloads the latest published AppImage from GitHub Releases, checks and installs the required runtime packages with pacman, installs the app under `~/.local/opt/fieldwork`, and creates a standard XDG desktop entry plus a command-line launcher.

```bash
curl -fL https://raw.githubusercontent.com/filwan4/osint/main/scripts/install-cachyos.sh \
  -o /tmp/fieldwork-install.sh
bash /tmp/fieldwork-install.sh
```

Launch Fieldwork from an application menu that indexes XDG desktop entries, or run:

```bash
~/.local/bin/fieldwork
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
- `.github/workflows`: CI and Linux release automation.
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

### Creating a release

Keep the version in `Cargo.toml`, `apps/desktop/package.json`, and `apps/desktop/src-tauri/tauri.conf.json` in sync. Then push a matching version tag:

```bash
git tag v0.1.2
git push origin v0.1.2
```

GitHub Actions builds the frontend and Rust application on Ubuntu 22.04 and publishes the AppImage to GitHub Releases. Ubuntu 22.04 is used as a conservative Linux build baseline for glibc compatibility.

## Updates

Updates are currently installed manually by running the CachyOS installer again. Signed in-app updates are not enabled.

## Status

- [x] Rust workspace and shared evidence models
- [x] Tauri 2 desktop shell
- [x] Local DNS-name validation
- [x] CI and Linux AppImage release workflow
- [x] CachyOS installer and XDG desktop launcher
- [ ] First live public-source collector
- [ ] Persistent investigation storage
- [ ] Evidence graph and report export
- [ ] Signed in-app updates

## License

No license has been selected. Public visibility does not automatically grant reuse rights.
