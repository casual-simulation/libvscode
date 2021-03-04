import { init } from 'libvscode';

console.log("Start!");
init({
    container: document.body,
    workbench: {
        // the empty authority means github1s should get it from `window.location.href`
        folderUri: { scheme: 'github1s', authority: '', path: '/' },
        staticExtensions: [],
        enableSyncByDefault: false,
    }
});