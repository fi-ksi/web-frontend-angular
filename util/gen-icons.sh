#!/bin/bash

ICON_SRC="src/assets/img/karlik_color.png"
ICONS_DIR="src/assets/icons"

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

re_size='^.*icon-([0-9]+)x([0-9]+)\.png$'

for f in "$ICONS_DIR/"*; do
  size_x="$(echo "$f" | sed -Ee "s/$re_size/\1/")"
  size_y="$(echo "$f" | sed -Ee "s/$re_size/\2/")"
  if [ -z "$size_x" ] || [ -z "$size_y" ]; then
    echo "$f - SKIP"
    continue
  fi

  convert "$ICON_SRC" -resize "${size_x}x${size_y}" "$f" &&
  echo "$f - OK"
done
