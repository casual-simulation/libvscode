import { initVSCode } from 'libvscode';

initVSCode({
    container: document.body,
    publicPath: '/',
    workbench: {
        folderUri: { scheme: 'libvscode', authority: '', path: '/' },
        staticExtensions: [],
        enableSyncByDefault: false,
    },
});
