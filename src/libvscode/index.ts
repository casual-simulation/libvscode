const publicPath = (<any>globalThis).VSCODE_PUBLIC_PATH ?? `/static`;
const originPath = `${globalThis.location.origin}${publicPath}`;
const vscodePath = `${originPath}/vscode`;

import type { IDisposable, IWorkbenchConstructionOptions, UriComponents } from 'vs/workbench/workbench.web.api';
import type { IScannedBuiltinExtension } from 'vs/workbench/services/extensionManagement/browser/builtinExtensionsScannerService';

/**
 * Initializes VSCode with the given options.
 * @param options The options that should be used to initialize vscode.
 */
export async function init(options: InitVscodeOptions): Promise<IDisposable> {
    await initLoader();
    return await initWorkbench(options);
}

let loaded = false;

async function initLoader() {
    if (!loaded) {
        loaded = true;
        await Promise.all([
            injectScript(`${originPath}/loader.js`),
            injectScript(`${vscodePath}/vs/workbench/workbench.web.api.js`),
        ]);
    }
}

async function injectScript(script: string) {
    return new Promise((resolve, reject) => {
        const loaderScript = document.createElement('script');
        loaderScript.src = script;
        loaderScript.onload = () => resolve();
        loaderScript.onerror = (err: any) => reject(err);
        document.body.appendChild(loaderScript); 
    });
}

async function initWorkbench(options: InitVscodeOptions) {
    const workbench = await new Promise<any>((resolve, reject) => {
        try {
            require(['vs/code/browser/workbench/workbench'], function (workbench) {
                resolve(workbench);
            }, function(err) {
                reject(err);
            });
        } catch(err) {
            reject(err);
        }
    });

    let builtinExtensions: InitVscodeOptions['builtinExtensions'];
    if (options.builtinExtensions) {
        builtinExtensions = options.builtinExtensions;
    } else {
        console.log('Fetching builtin extensions from extensions.json');
        builtinExtensions = JSON.parse(await (await fetch(publicPath + '/configure/extensions.json')).text());
    }
    
    return workbench.init(
        options.container, 
        { 
            webviewEndpoint: `${vscodePath}/vs/workbench/contrib/webview/browser/pre`,
            webWorkerExtensionHostIframeSrc: `${vscodePath}/vs/workbench/services/extensions/worker/httpWebWorkerExtensionHostIframe.html`,
            ...options.workbench
        },
        builtinExtensions);
}

/**
 * Options that can be provided to initialize vscode.
 */
export interface InitVscodeOptions {

    /**
     * The HTML element that vscode should be mounted to.
     */
    container: HTMLElement;

    /**
     * The settings used to initialize the vscode workbench.
     */
    workbench: IWorkbenchConstructionOptions & {
		folderUri?: UriComponents;
		workspaceUri?: UriComponents;
	};

    /**
     * The list of extensions that should be loaded by default.
     */
    builtinExtensions?: IScannedBuiltinExtension[];
}