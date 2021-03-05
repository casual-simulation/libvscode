#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${0}")/../.."
APP_ROOT=$(pwd)

function main() {
    cd ${APP_ROOT}
    mkdir -p dist
    cp resources/test.html dist/test.html

    echo "copy resources done!"
}

main "$@"
