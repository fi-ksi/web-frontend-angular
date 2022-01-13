#!/bin/bash
# A cgi hook that takes URL with new FE build on stdin

GITHUB_OWNER="fi-ksi"
GITHUB_REPOSITORY="web-frontend-angular"
PATCH_FILE_NAME="build.tar"

TARGET_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
INPUT="$(cat)"

[ -z "$HOME" ] && HOME="$(eval echo "~$(whoami)")"
echo "Deploying as $(whoami), TARGET=$TARGET_DIR, HOME=$HOME" >&2

function main() {
  downloadUrl="$INPUT"
  if [ -z "$downloadUrl" ]; then
    echo "ERR: NO INPUT"
    return 0
  fi

  regexUrl="^https://github.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases/download/.*/${PATCH_FILE_NAME}\$"

  if echo "$downloadUrl" | grep --quiet -E "$regexUrl"; then
    # continues only if github owner and repo and filename matches
    downloadPath="$(mktemp --suffix=.tar)" &&
    extractDir="$(mktemp -d)" &&
    wget --progress=bar:force:noscroll --output-document "$downloadPath" "$downloadUrl" > /dev/null &&
    tar -xf "$downloadPath" -C "$extractDir" > /dev/null &&
    rm "$downloadPath" > /dev/null &&
    rsync -rE --delete-after "$extractDir/" "$TARGET_DIR" > /dev/null &&
    rm -rf "$extractDir" > /dev/null &&
    echo "OK"
  else
    echo "ERR: INVALID INPUT"
    echo "INPUT: '$downloadUrl'"
  fi
}

function __run_main() {
  echo "Content-Type: text/plain"
  response="$(main)"
  mainResult="$?"

  if [ "$mainResult" -ne 0 ]; then
    echo 'Status: 500 Internal server error'
    echo ''
    echo "ERR: UNKNOWN ERROR"
  else
    echo ''
    echo "$response"
  fi
}

function __run_main_sandboxed() {
    if ps -p 1 | tail -n 1 | grep --quiet -Fv 'firejail'; then # firejail is not active right now
      firejail --help &>/dev/null &&  # firejail is available
      echo "Initializing sandboxed process" >&2
      echo "$INPUT" | firejail \
               --noprofile \
               --private-tmp \
               --read-write="$HOME" \
               --private="$TARGET_DIR" \
               --protocol=inet,inet6 \
               --noautopulse \
               --novideo \
               --nosound \
               --nodvd \
               --shell=/bin/bash \
               -- \
               bash -c "cd \"$HOME\"; bash \"$(basename "$(dirname "$(realpath "$0")")")/$(basename "$0")\""
      true
    else
      echo "Running sandboxed" >&2
      false
    fi
}

__run_main_sandboxed ||
__run_main
