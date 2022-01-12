#!/bin/bash
# A cgi hook that takes URL with new FE build on stdin

GITHUB_OWNER="esoadamo"
GITHUB_REPOSITORY="web-frontend-angular"
PATCH_FILE_NAME="build.tar"

TARGET_DIR="$(pwd)"

function main() {
  downloadUrl="$(cat)"
  if [ -z "$downloadUrl" ]; then
    echo "ERR: NO INPUT"
    return 0
  fi

  regexUrl="^https://github.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases/download/.*/${PATCH_FILE_NAME}\$"

  if echo "$downloadUrl" | grep --quiet -E "$regexUrl"; then
    # continues only if github owner and repo and filename matches
    downloadPath="$(mktemp --suffix=.tar)" &&
    extractDir="$(mktemp -d)" &&
    wget --output-document "$downloadPath" "$downloadUrl" > /dev/null &&
    tar -xf "$downloadPath" -C "$extractDir" > /dev/null &&
    rm "$downloadPath" > /dev/null &&
    rsync -r --delete-after "$extractDir/" "$TARGET_DIR" > /dev/null &&
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

__run_main
