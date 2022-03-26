#!/bin/bash

function fail() {
    echo "ERR: $1"
    exit 1
}

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

if [ ! -f 'swagger-codegen-cli.jar' ]; then
  wget 'https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.33/swagger-codegen-cli-3.0.33.jar' -O swagger-codegen-cli.jar || fail "Swagger download failed"
fi

cli="java -jar swagger-codegen-cli.jar"

$cli generate -l typescript-angular -i ../web-backend-swagger/src/swagger/swagger.json -o src/api -c swagger-config.json

# fix some auto-generated mess
cd src/api || fail "Cannot cd to api"

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
sed -E 's|(\s+)public authorizeForm\(grant_type: string, username: string, password: string, refresh_token: string,|\1// @ts-ignore\n\1public  authorizeForm(grant_type: string, username: string = "", password: string = "", refresh_token: string = "",|' -i 'api/default.service.ts'

# next two lines are setting correct Blob response type for requests with Blob return type
sed -E 's|(.*this.httpClient.request<Blob>.*)|\1//@ts-ignore|' -i 'api/default.service.ts'
sed -E '/.*this.httpClient.request<Blob>.*/{n;s/.*/\{responseType: "blob",/}' -i 'api/default.service.ts'
