#!/bin/bash

function fail() {
    echo "ERR: $1"
    exit 1
}

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

if [ ! -f 'swagger-codegen-cli.jar' ]; then
  wget 'https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.20/swagger-codegen-cli-3.0.20.jar' -O swagger-codegen-cli.jar || fail "Swagger download failed"
fi

cli="java -jar swagger-codegen-cli.jar"

$cli generate -l typescript-angular -i ../web-backend-swagger/src/swagger/swagger.json -o src/api
