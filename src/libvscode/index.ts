import type {
    IDisposable,
    IWorkbenchConstructionOptions,
    UriComponents,
} from 'vs/workbench/workbench.web.api';
import type { IScannedBuiltinExtension } from 'vs/workbench/services/extensionManagement/browser/builtinExtensionsScannerService';

/**
 * The default VSCode version hash that is injected into this file by the build process.
 */
declare let VSCODE_VERSION_HASH: string;

/**
 * Initializes VSCode with the given options.
 * @param options The options that should be used to initialize vscode.
 */
export async function initVSCode(
    options: InitVscodeOptions
): Promise<IDisposable> {
    if (!options.container) {
        throw new Error('A container must be provided.');
    }
    if (!options.publicPath) {
        throw new Error('A public path must be provided');
    }
    if (!options.vscodeVersionHash) {
        options.vscodeVersionHash = VSCODE_VERSION_HASH;
    }
    (<any>globalThis).VSCODE_PUBLIC_PATH = options.publicPath;
    await initLoader(options);
    return await initWorkbench(options);
}

/**
 * Fetches the list of builtin extensions.
 * @param publicPath The public path that the extensions should be fetched from.
 * @param vscodeVersionHash The version hash that libvscode was built from.
 */
export async function fetchBuiltinExtensions(publicPath: string, vscodeVersionHash: string = VSCODE_VERSION_HASH): Promise<IScannedBuiltinExtension[]> {
    console.log('Fetching builtin extensions from extensions.json');
    let builtinExtensions: IScannedBuiltinExtension[] = JSON.parse(
        await (
            await fetch(`${publicPath}/${vscodeVersionHash}/configure/extensions.json`)
        ).text()
    );
    return builtinExtensions;
}

let loaded = false;

async function initLoader(options: InitVscodeOptions) {
    if (!loaded) {
        loaded = true;
        const originPath = `${globalThis.location.origin}${options.publicPath}/${options.vscodeVersionHash}`;
        const vscodePath = `${originPath}/vscode`;
        await Promise.all([
            injectScript(options.container, `${originPath}/loader.js`),
            injectScript(
                options.container,
                `${vscodePath}/vs/workbench/workbench.web.api.js`
            ),
        ]);
    }
}

async function injectScript(container: HTMLElement, script: string) {
    return new Promise((resolve, reject) => {
        const loaderScript = document.createElement('script');
        loaderScript.src = script;
        loaderScript.onload = () => resolve();
        loaderScript.onerror = (err: any) => reject(err);
        container.appendChild(loaderScript);
    });
}

async function initWorkbench(options: InitVscodeOptions) {
    const workbench = await new Promise<any>((resolve, reject) => {
        try {
            require(['vs/code/browser/workbench/workbench'], function (
                workbench
            ) {
                resolve(workbench);
            }, function (err) {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });

    let builtinExtensions: InitVscodeOptions['builtinExtensions'];
    if (options.builtinExtensions) {
        builtinExtensions = options.builtinExtensions;
    } else {
        console.log('Fetching builtin extensions from extensions.json');
        builtinExtensions = await fetchBuiltinExtensions(options.publicPath, options.vscodeVersionHash);
    }

    const originPath = `${globalThis.location.origin}${options.publicPath}/${options.vscodeVersionHash}`;
    const vscodePath = `${originPath}/vscode`;

    return workbench.init(
        options.container,
        {
            webviewEndpoint: `${vscodePath}/vs/workbench/contrib/webview/browser/pre`,
            webWorkerExtensionHostIframeSrc: `${vscodePath}/vs/workbench/services/extensions/worker/httpWebWorkerExtensionHostIframe.html`,
            ...options.workbench,
        },
        builtinExtensions
    );
}

export enum LogLevel {
    Trace,
    Debug,
    Info,
    Warning,
    Error,
    Critical,
    Off,
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
     * The path that the VSCode scripts & assets are available at.
     */
    publicPath: string;

    /**
     * The hash that is used for the static folder that vscode is loaded from.
     */
    vscodeVersionHash?: string;

    /**
     * The settings used to initialize the vscode workbench.
     */
    workbench: IWorkbenchConstructionOptions & {
        /**
         * The folder that should be opened.
         */
        folderUri?: UriComponents;

        /**
         * The workspace that should be opened.
         */
        workspaceUri?: UriComponents;
    };

    /**
     * The list of extensions that should be loaded by default.
     */
    builtinExtensions?: IScannedBuiltinExtension[];
}
