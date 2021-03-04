#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${0}")/../.."
APP_ROOT=$(pwd)

function main() {
	cd ${APP_ROOT}
	mkdir -p dist/intermediate
	if [ "${IS_BUILD-}" ];
	then
		cp resources/index.html dist/intermediate/index.html
	else
		cp resources/index-dev.html dist/intermediate/index.html
	fi
	cp resources/favicon.ico dist/intermediate
	cp resources/manifest.json dist/intermediate

	echo "copy resources done!"
}

main "$@"
