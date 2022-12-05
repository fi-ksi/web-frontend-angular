#!/bin/bash

function fail() {
    echo "ERR: $1"
    exit 1
}

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

changelog="$(git log --pretty=format:'{%n "subject": "%s",%n  "author": {%n    "date": "%aD"%n  }%n},')"
changelog="[${changelog::-1}]"

# Escape " in commit messages
while true; do
  changelogNew="$(echo "$changelog" | sed -Ee 's:^(.*".*".*)"(.*?)"(.*".*$):\1`\2`\3:')"
  [ "$changelog" == "$changelogNew" ] && break
  changelog="$changelogNew"
done

version="$(git log -1 --format="%ct" | xargs -I{} date -d @{} +%y%m%d.%H%M%S)"

echo "$version" > src/assets/changelog/version.txt
echo "$changelog" > src/assets/changelog/changelog.json
