#!/usr/bin/env bash
set -Eeuo pipefail

REPO="filwan4/osint"
API_URL="https://api.github.com/repos/$REPO/releases/latest"
RAW_ICON_URL="https://raw.githubusercontent.com/$REPO/main/apps/desktop/src-tauri/icons/icon.svg"

fail() {
  echo "Fieldwork installer: $1" >&2
  exit 1
}

if [[ "$(uname -m)" != "x86_64" ]]; then
  fail "This release currently supports x86_64 only."
fi

if ! command -v pacman >/dev/null 2>&1; then
  fail "This installer is intended for CachyOS / Arch Linux (pacman)."
fi

if [[ "$EUID" -eq 0 ]]; then
  fail "Run this installer as your desktop user without sudo. It will request sudo only when installing system packages."
fi

command -v sudo >/dev/null 2>&1 || fail "sudo is required to install system dependencies."
SUDO=(sudo)

if ! command -v curl >/dev/null 2>&1 || ! command -v python3 >/dev/null 2>&1; then
  echo "Installing curl and Python..."
  "${SUDO[@]}" pacman -S --needed curl python
fi

RUNTIME_PACKAGES=(
  webkit2gtk-4.1
  gtk3
  libappindicator-gtk3
  openssl
  fuse2
  hicolor-icon-theme
  desktop-file-utils
)

MISSING_PACKAGES=()
for package in "${RUNTIME_PACKAGES[@]}"; do
  if ! pacman -Q "$package" >/dev/null 2>&1; then
    MISSING_PACKAGES+=("$package")
  fi
done

if [[ "${#MISSING_PACKAGES[@]}" -gt 0 ]]; then
  echo "Installing missing runtime dependencies: ${MISSING_PACKAGES[*]}"
  "${SUDO[@]}" pacman -S --needed "${MISSING_PACKAGES[@]}"
fi

echo "Looking up the latest Fieldwork release..."
RELEASE_JSON="$(curl -fsSL -H 'Accept: application/vnd.github+json' "$API_URL")" ||
  fail "Could not query GitHub Releases."

ASSET_DETAILS="$(python3 -c '
import json
import sys

release = json.load(sys.stdin)
assets = [
    asset for asset in release.get("assets", [])
    if asset.get("name", "").lower().endswith(".appimage")
]
native = [
    asset for asset in assets
    if "amd64" in asset.get("name", "").lower()
    or "x86_64" in asset.get("name", "").lower()
]
choices = native or (assets if len(assets) == 1 else [])
if choices:
    asset = choices[0]
    print("|".join((
        release.get("tag_name", ""),
        asset.get("browser_download_url", ""),
        asset.get("digest", ""),
    )))
' <<< "$RELEASE_JSON")"

IFS='|' read -r RELEASE_TAG DOWNLOAD_URL EXPECTED_DIGEST <<< "$ASSET_DETAILS"

[[ -n "$DOWNLOAD_URL" ]] || fail "No x86_64 AppImage was found in the latest published release."
[[ "$EXPECTED_DIGEST" =~ ^sha256:[[:xdigit:]]{64}$ ]] ||
  fail "The latest release does not provide a valid SHA-256 digest."

INSTALL_DIR="$HOME/.local/opt/fieldwork"
BIN_DIR="$HOME/.local/bin"
APP_PATH="$INSTALL_DIR/Fieldwork.AppImage"
STAGED_APP_PATH="$INSTALL_DIR/.Fieldwork.AppImage.new"
ICON_DIR="$HOME/.local/share/icons/hicolor/scalable/apps"
DESKTOP_DIR="$HOME/.local/share/applications"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"; rm -f "$STAGED_APP_PATH"' EXIT

mkdir -p "$INSTALL_DIR" "$BIN_DIR" "$ICON_DIR" "$DESKTOP_DIR"

echo "Downloading Fieldwork..."
curl -fL --retry 3 "$DOWNLOAD_URL" -o "$TEMP_DIR/Fieldwork.AppImage" ||
  fail "The AppImage download failed."

if [[ "$(head -c 4 "$TEMP_DIR/Fieldwork.AppImage" | od -An -tx1 | tr -d ' \n')" != "7f454c46" ]]; then
  fail "The downloaded file is not a valid Linux executable."
fi

EXPECTED_SHA256="${EXPECTED_DIGEST#sha256:}"
ACTUAL_SHA256="$(sha256sum "$TEMP_DIR/Fieldwork.AppImage" | awk '{print $1}')"
[[ "$ACTUAL_SHA256" == "$EXPECTED_SHA256" ]] ||
  fail "The downloaded AppImage failed its SHA-256 integrity check."

install -m 755 "$TEMP_DIR/Fieldwork.AppImage" "$STAGED_APP_PATH"
mv -f "$STAGED_APP_PATH" "$APP_PATH"

ICON_NAME="applications-development"
if curl -fsSL "$RAW_ICON_URL" -o "$ICON_DIR/fieldwork.svg"; then
  ICON_NAME="fieldwork"
fi

cat > "$BIN_DIR/fieldwork" <<EOF
#!/usr/bin/env bash
exec env APPIMAGE_EXTRACT_AND_RUN=1 "$APP_PATH" "\$@"
EOF
chmod 755 "$BIN_DIR/fieldwork"

cat > "$DESKTOP_DIR/fieldwork.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fieldwork
GenericName=OSINT Research Workspace
Comment=Public-source research and analysis workspace
Exec="$BIN_DIR/fieldwork"
Icon=$ICON_NAME
Terminal=false
Categories=Development;Utility;
StartupNotify=true
EOF

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -q -t -f "$HOME/.local/share/icons/hicolor" >/dev/null 2>&1 || true
fi

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

echo
echo "Fieldwork $RELEASE_TAG is installed."
echo "Desktop entry: $DESKTOP_DIR/fieldwork.desktop"
echo "Command: $BIN_DIR/fieldwork"
echo "To update later, run this installer again."

if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo "Note: $BIN_DIR is not currently in PATH; the desktop entry still uses its full path."
fi
