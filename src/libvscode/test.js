import { initVSCode } from 'libvscode';

initVSCode({
	container: document.body,
	publicPath: '/static',
	workbench: {
		// the empty authority means github1s should get it from `window.location.href`
		folderUri: { scheme: 'github1s', authority: '', path: '/' },
		staticExtensions: [],
		enableSyncByDefault: false,
	},
});
