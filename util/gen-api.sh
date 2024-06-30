#!/bin/bash
set -exuo pipefail

function fail() {
    echo "ERR: $1"
    exit 1
}

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

# Download swagger

if [ ! -f 'swagger-codegen-cli.jar' ]; then
  wget 'https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.34/swagger-codegen-cli-3.0.34.jar' -O swagger-codegen-cli.jar || fail "Swagger download failed"
fi

DIR_PROJECT_ROOT="$(realpath .)"
cli="java -jar swagger-codegen-cli.jar"

# Generate backend API
$cli generate -l typescript-angular -i ../web-backend-swagger/src/swagger/swagger.json -o src/api/backend -c "$DIR_PROJECT_ROOT/swagger-config.json"

# fix some auto-generated mess
cd src/api/backend || fail "Cannot cd to api"

echo "Fixing mess"
for f in $(find . -type f -name '*.ts' -print); do
  echo "- $f"
  sed -E \
    -e 's/&lt;/</' \
    -e 's/&gt;/>/' \
    -e 's/: Array<(\w+?)> \| Array<Array>;/: Array<\1> | Array<Array<\1>>;/' \
    -e 's\Array<string> | Array&lt;Array&gt;\Array<string> | Array<Array<string>>; //\' \
    -i "$f"
done

sed -e 's/parent: number;/parent: number | null;/' -i 'model/postsCreation.ts'
sed -e 's/github: string;/github: string | null;/' -i 'model/profile.ts'
sed -e 's/github: string;/github: string | null;/' -i 'model/profileEdit.ts'
sed -e 's/github: string;/github: string | null;/' -i 'model/registrationRequest.ts'
sed -e 's/discord: string;/discord: string | null;/' -i 'model/profile.ts'
sed -e 's/discord: string;/discord: string | null;/' -i 'model/profileEdit.ts'
sed -e 's/discord: string;/discord: string | null;/' -i 'model/registrationRequest.ts'
sed -e 's/task: number;/task: number | null;/' -i 'model/achievementGrantRequest.ts'
sed -e 's/e_mail/"e-mail"/' -i 'model/emailSendRequest.ts'
sed -E 's|(\s+)public authorizeForm\(grant_type: string, username: string, password: string, refresh_token: string,|\1// @ts-ignore\n\1public  authorizeForm(grant_type: string, username: string = "", password: string = "", refresh_token: string = "",|' -i 'api/default.service.ts'

# next two lines are setting correct Blob response type for requests with Blob return type
sed -E 's|(.*this.httpClient.request<Blob>.*)|\1//@ts-ignore|' -i 'api/default.service.ts'
sed -E '/.*this.httpClient.request<Blob>.*/{n;s/.*/\{responseType: "blob",/}' -i 'api/default.service.ts'

# Generate EduLint API
cd "$DIR_PROJECT_ROOT"
URL_EDULINT="https://edulint.com/api/openapi.yaml"
FILE_EDULINT="src/api/edulint.yaml"
wget --output-document="$FILE_EDULINT" "$URL_EDULINT"

$cli generate -l typescript-angular -i "$FILE_EDULINT" -o src/api/edulint -c "$DIR_PROJECT_ROOT/swagger-config.json"
