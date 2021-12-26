#!/bin/bash

function fail() {
    echo "ERR: $1"
    exit 1
}

cd "$(dirname "$(realpath "$0")")/../" || fail "Cannot cd here"

if [ ! -f 'swagger-codegen-cli.jar' ]; then
  wget 'https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.27/swagger-codegen-cli-3.0.27.jar' -O swagger-codegen-cli.jar || fail "Swagger download failed"
fi

cli="java -jar swagger-codegen-cli.jar"

$cli generate -l typescript-angular -i ../web-backend-swagger/src/swagger/swagger.json -o src/api

# fix some auto-generated mess
cd src/api || fail "Cannot cd to api"

echo "Fixing mess"
for f in $(find . -type f -name '*.ts' -print); do
  echo "- $f"
  sed -E \
    -e 's/&lt;/</' \
    -e 's/&gt;/>/' \
    -e 's/: Array<(\w+?)> \| Array<Array>;/: Array<\1> | Array<Array<\1>>;/' \
    -e 's/timePublished: string;/time_published: string;/' \
    -e 's/timeDeadline: string;/time_deadline: string;/' \
    -e 's/profilePicture: string;/profile_picture: string;/' \
    -e 's/firstName: string;/first_name: string;/' \
    -e 's/lastName: string;/last_name: string;/' \
    -e 's/nickName: string;/nick_name: string;/' \
    -e 's/tasksNum: number;/tasks_num: number;/' \
    -e 's|/task-details|/taskDetails|' \
    -e 's/accessToken: string/access_token: string/' \
    -e 's/expiresIn: number/expires_in: number/' \
    -e 's/refreshToken: string/refresh_token: string/' \
    -e 's/tokenType: /token_type: /' \
    -e 's/pictureBase: /picture_base: /' \
    -e 's/pictureSuffix: /picture_suffix: /' \
    -e 's/maxScore: number;/max_score: number;/' \
    -e 's/coAuthor: number;/co_author: number;/' \
    -e 's/postsCount: number;/posts_count: number;/' \
    -e 's/rootPosts:/root_posts:/' \
    -e 's/publishedAt:/published_at:/' \
    -e 's/submittedFiles:/submitted_files:/' \
    -e 's\Array<string> | Array&lt;Array&gt;\Array<string> | Array<Array<string>>; //\' \
    -i "$f"
done

sed 's/: ModuleWithProviders/: ModuleWithProviders<ApiModule>/' -i 'api.module.ts'
sed -E 's|(\s+)public authorizeForm\(grantType: string, username: string, password: string, refresh_token: string,|\1// @ts-ignore\n\1public  authorizeForm(grantType: string, username: string = "", password: string = "", refreshToken: string = "",|' -i 'api/default.service.ts'

# next two lines are setting correct Blob response type for requests with Blob return type
sed -E 's|(.*this.httpClient.request<Blob>.*)|\1//@ts-ignore|' -i 'api/default.service.ts'
sed -E '/.*this.httpClient.request<Blob>.*/{n;s/.*/\{responseType: "blob",/}' -i 'api/default.service.ts'
