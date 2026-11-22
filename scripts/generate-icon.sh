#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ICON_DIR="$ROOT_DIR/apps/desktop/src-tauri/icons"
SVG="$ICON_DIR/icon.svg"
PNG="$ICON_DIR/icon.png"

mkdir -p "$ICON_DIR"

if command -v rsvg-convert >/dev/null 2>&1; then
  rsvg-convert --width 512 --height 512 --output "$PNG" "$SVG"
elif command -v magick >/dev/null 2>&1; then
  magick -background none "$SVG" -resize 512x512 PNG32:"$PNG"
else
  echo "Missing icon renderer. Install librsvg (rsvg-convert) or ImageMagick (magick)." >&2
  exit 1
fi

echo "Generated Tauri icon: $PNG"
