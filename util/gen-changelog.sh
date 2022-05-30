#!/bin/bash

function fail() {
    echo "ERR: $1"
    exit 1
}

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

changelog="$(git log --pretty=format:'{%n  "commit": "%H",%n  "abbreviated_commit": "%h",%n  "tree": "%T",%n  "abbreviated_tree": "%t",%n  "parent": "%P",%n  "abbreviated_parent": "%p",%n  "refs": "%D",%n  "encoding": "%e",%n  "subject": "%s",%n  "sanitized_subject_line": "%f",%n  "body": "%b",%n  "commit_notes": "%N",%n  "verification_flag": "%G?",%n  "signer": "%GS",%n  "signer_key": "%GK",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  },%n  "commiter": {%n    "name": "%cN",%n    "email": "%cE",%n    "date": "%cD"%n  }%n},')"
changelog="[${changelog::-1}]"

# Escape " in commit messages
while true; do
  changelogNew="$(echo "$changelog" | sed -Ee 's:^(.*".*".*)"(.*?)"(.*".*$):\1`\2`\3:')"
  [ "$changelog" == "$changelogNew" ] && break
  changelog="$changelogNew"
done

version="$(git log -1 --format="%at" | xargs -I{} date -d @{} +%y%m%d.%H%M%S)"

echo "$version" > src/assets/changelog/version.txt
echo "$changelog" > src/assets/changelog/changelog.json
