#!/usr/bin/env bash
# ig-src/*.svg → ../img/*.png (헤드리스 Chrome, 1800×1200). 인자 없으면 전부
set -euo pipefail
cd "$(dirname "$0")"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=../img
names=("$@")
[ ${#names[@]} -eq 0 ] && names=(ig-0*.svg)
for f in "${names[@]}"; do
  n="${f%.svg}"
  "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1800,1200 --screenshot="$PWD/$OUT/$n.png" "file://$PWD/$n.svg" >/dev/null 2>&1
  echo "png $n.png $(sips -g pixelWidth -g pixelHeight "$OUT/$n.png" | awk '/pixel/{printf "%s ", $2}')"
done
