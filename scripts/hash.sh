#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${0}")/.."
APP_ROOT=$(pwd)

COMMIT_ID=$(git rev-parse HEAD)
SHORT_COMMIT_ID=${COMMIT_ID:0:7}
STATIC_FOLDER_NAME="static-${SHORT_COMMIT_ID-unknown}"

if [ -e "${APP_ROOT}/dist/intermediate/static" ]; then
	mv "${APP_ROOT}/dist/intermediate/static" "${APP_ROOT}/dist/intermediate/${STATIC_FOLDER_NAME}"
	sed "s/{STATIC_FOLDER}/${STATIC_FOLDER_NAME}/" "${APP_ROOT}/resources/index-hash.html" > "${APP_ROOT}/dist/intermediate/404.html"
	rm -f "${APP_ROOT}/dist/intermediate/index.html" # remove the exists `index.html` file
	echo "hash static files done"
else
	echo "Please build github1s first"
fi
