#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${0}")/.."
APP_ROOT=$(pwd)
export IS_BUILD="true"

# execute all necessary tasks
function main() {
    rm -rf "${APP_ROOT}/dist"
    cd "${APP_ROOT}/scripts"
    ./build/sync-code.sh
    ./build/build-vscode.sh
    ./build/build-extensions.sh
    ./package.sh
    ./hash.sh

    node ./build/build-entry.cjs

    echo "all build done!"
}

main "$@"