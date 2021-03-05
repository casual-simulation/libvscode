{
    globalThis.MonacoPerformanceMarks = globalThis.MonacoPerformanceMarks || [];
    const originPath = globalThis.VSCODE_ORIGIN_PATH;
    const vscodePath = globalThis.VSCODE_PUBLIC_PATH;

    globalThis.require = {
        baseUrl: vscodePath,
        recordStats: true,
        trustedTypesPolicy: globalThis.trustedTypes?.createPolicy('amdLoader', {
            createScriptURL(value) {
                if (value.startsWith(globalThis.location.origin)) {
                    return value;
                }
                throw new Error(`Invalid script url: ${value}`);
            },
        }),
        paths: {
            'vscode-textmate': `${originPath}/node_modules/vscode-textmate/release/main`,
            'vscode-oniguruma': `${originPath}/node_modules/vscode-oniguruma/release/main`,
            xterm: `${originPath}/node_modules/xterm/lib/xterm.js`,
            'xterm-addon-search': `${originPath}/node_modules/xterm-addon-search/lib/xterm-addon-search.js`,
            'xterm-addon-unicode11': `${originPath}/node_modules/xterm-addon-unicode11/lib/xterm-addon-unicode11.js`,
            'xterm-addon-webgl': `${originPath}/node_modules/xterm-addon-webgl/lib/xterm-addon-webgl.js`,
            'tas-client-umd': `${originPath}/node_modules/tas-client-umd/lib/tas-client-umd.js`,
            'iconv-lite-umd': `${originPath}/node_modules/iconv-lite-umd/lib/iconv-lite-umd.js`,
            jschardet: `${originPath}/node_modules/jschardet/dist/jschardet.min.js`,
        },
    };
}
