import type {
    IDisposable,
    IWorkbenchConstructionOptions,
    UriComponents,
} from 'vs/workbench/workbench.web.api';
import type { IScannedBuiltinExtension } from 'vs/workbench/services/extensionManagement/browser/builtinExtensionsScannerService';

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
    (<any>globalThis).VSCODE_PUBLIC_PATH = options.publicPath;
    await initLoader(options);
    return await initWorkbench(options);
}

let loaded = false;

async function initLoader(options: InitVscodeOptions) {
    if (!loaded) {
        loaded = true;
        const originPath = `${globalThis.location.origin}${options.publicPath}`;
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
        builtinExtensions = JSON.parse(
            await (
                await fetch(options.publicPath + '/configure/extensions.json')
            ).text()
        );
    }

    const originPath = `${globalThis.location.origin}${options.publicPath}`;
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
