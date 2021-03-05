/**
 * Initializes VSCode with the given options.
 * @param options The options that should be used to initialize vscode.
 */
export function initVSCode(options: InitVscodeOptions): Promise<IDisposable>;

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

interface IWorkbenchConstructionOptions {
    //#region Connection related configuration

    /**
     * The remote authority is the IP:PORT from where the workbench is served
     * from. It is for example being used for the websocket connections as address.
     */
    readonly remoteAuthority?: string;

    /**
     * The connection token to send to the server.
     */
    readonly connectionToken?: string;

    /**
     * An endpoint to serve iframe content ("webview") from. This is required
     * to provide full security isolation from the workbench host.
     */
    readonly webviewEndpoint?: string;

    /**
     * An URL pointing to the web worker extension host <iframe> src.
     */
    readonly webWorkerExtensionHostIframeSrc?: string;

    /**
     * A factory for web sockets.
     */
    readonly webSocketFactory?: IWebSocketFactory;

    /**
     * A provider for resource URIs.
     */
    readonly resourceUriProvider?: IResourceUriProvider;

    /**
     * Resolves an external uri before it is opened.
     */
    readonly resolveExternalUri?: IExternalUriResolver;

    /**
     * A provider for supplying tunneling functionality,
     * such as creating tunnels and showing candidate ports to forward.
     */
    readonly tunnelProvider?: ITunnelProvider;

    /**
     * Endpoints to be used for proxying authentication code exchange calls in the browser.
     */
    readonly codeExchangeProxyEndpoints?: { [providerId: string]: string };

    //#endregion

    //#region Workbench configuration

    /**
     * A handler for opening workspaces and providing the initial workspace.
     */
    readonly workspaceProvider?: IWorkspaceProvider;

    /**
     * Enables Settings Sync by default.
     *
     * Syncs with the current authenticated user account (provided in [credentialsProvider](#credentialsProvider)) by default.
     *
     * @deprecated Instead use [settingsSyncOptions](#settingsSyncOptions) to enable/disable settings sync in the workbench.
     */
    readonly enableSyncByDefault?: boolean;

    /**
     * Settings sync options
     */
    readonly settingsSyncOptions?: ISettingsSyncOptions;

    /**
     * The credentials provider to store and retrieve secrets.
     */
    readonly credentialsProvider?: ICredentialsProvider;

    /**
     * Add static extensions that cannot be uninstalled but only be disabled.
     */
    readonly staticExtensions?: ReadonlyArray<IStaticExtension>;

    /**
     * [TEMPORARY]: This will be removed soon.
     * Enable inlined extensions.
     * Defaults to false on serverful and true on serverless.
     */
    readonly _enableBuiltinExtensions?: boolean;

    /**
     * [TEMPORARY]: This will be removed soon.
     * Enable `<iframe>` wrapping.
     * Defaults to false.
     */
    readonly _wrapWebWorkerExtHostInIframe?: boolean;

    /**
     * Support for URL callbacks.
     */
    readonly urlCallbackProvider?: IURLCallbackProvider;

    /**
     * Support adding additional properties to telemetry.
     */
    readonly resolveCommonTelemetryProperties?: ICommonTelemetryPropertiesResolver;

    /**
     * A set of optional commands that should be registered with the commands
     * registry.
     *
     * Note: commands can be called from extensions if the identifier is known!
     */
    readonly commands?: readonly IWorkspaceCommand[];

    /**
     * Optional default layout to apply on first time the workspace is opened.
     */
    readonly defaultLayout?: IDefaultLayout;

    /**
     * Optional configuration default overrides contributed to the workbench.
     */
    readonly configurationDefaults?: Record<string, any>;

    //#endregion

    //#region Update/Quality related

    /**
     * Support for update reporting
     */
    readonly updateProvider?: IUpdateProvider;

    /**
     * Support for product quality switching
     */
    readonly productQualityChangeHandler?: IProductQualityChangeHandler;

    //#endregion

    //#region Branding

    /**
     * Optional home indicator to appear above the hamburger menu in the activity bar.
     */
    readonly homeIndicator?: IHomeIndicator;

    /**
     * Optional override for the product configuration properties.
     */
    readonly productConfiguration?: Partial<IProductConfiguration>;

    /**
     * Optional override for properties of the window indicator in the status bar.
     */
    readonly windowIndicator?: IWindowIndicator;

    /**
     * Specifies the default theme type (LIGHT, DARK..) and allows to provide initial colors that are shown
     * until the color theme that is specified in the settings (`editor.colorTheme`) is loaded and applied.
     * Once there are persisted colors from a last run these will be used.
     *
     * The idea is that the colors match the main colors from the theme defined in the `configurationDefaults`.
     */
    readonly initialColorTheme?: IInitialColorTheme;

    //#endregion

    //#region Diagnostics

    /**
     * Current logging level. Default is `LogLevel.Info`.
     */
    readonly logLevel?: LogLevel;

    /**
     * Whether to enable the smoke test driver.
     */
    readonly driver?: boolean;

    //#endregion
}

export interface IScannedBuiltinExtension {
    extensionPath: string;
    packageJSON: IExtensionManifest;
    packageNLS?: any;
    readmePath?: string;
    changelogPath?: string;
}

export interface IDisposable {
    dispose(): void;
}

export class DisposableStore implements IDisposable {
    static DISABLE_DISPOSED_WARNING: boolean;

    /**
     * Dispose of all registered disposables and mark this object as disposed.
     *
     * Any future disposables added to this object will be disposed of on `add`.
     */
    public dispose(): void;

    /**
     * Dispose of all registered disposables but do not mark this object as disposed.
     */
    public clear(): void;

    public add<T extends IDisposable>(t: T): T;
}

/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */
export class URI implements UriComponents {
    static isUri(thing: any): thing is URI;

    /**
     * scheme is the 'http' part of 'http://www.msft.com/some/path?query#fragment'.
     * The part before the first colon.
     */
    readonly scheme: string;

    /**
     * authority is the 'www.msft.com' part of 'http://www.msft.com/some/path?query#fragment'.
     * The part between the first double slashes and the next slash.
     */
    readonly authority: string;

    /**
     * path is the '/some/path' part of 'http://www.msft.com/some/path?query#fragment'.
     */
    readonly path: string;

    /**
     * query is the 'query' part of 'http://www.msft.com/some/path?query#fragment'.
     */
    readonly query: string;

    /**
     * fragment is the 'fragment' part of 'http://www.msft.com/some/path?query#fragment'.
     */
    readonly fragment: string;

    /**
     * @internal
     */
    protected constructor(
        scheme: string,
        authority?: string,
        path?: string,
        query?: string,
        fragment?: string,
        _strict?: boolean
    );

    /**
     * @internal
     */
    protected constructor(components: UriComponents);

    /**
     * @internal
     */
    protected constructor(
        schemeOrData: string | UriComponents,
        authority?: string,
        path?: string,
        query?: string,
        fragment?: string,
        _strict?: boolean
    );

    // ---- filesystem path -----------------------

    /**
     * Returns a string representing the corresponding file system path of this URI.
     * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
     * platform specific path separator.
     *
     * * Will *not* validate the path for invalid characters and semantics.
     * * Will *not* look at the scheme of this URI.
     * * The result shall *not* be used for display purposes but for accessing a file on disk.
     *
     *
     * The *difference* to `URI#path` is the use of the platform specific separator and the handling
     * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
     *
     * ```ts
        const u = URI.parse('file://server/c$/folder/file.txt')
        u.authority === 'server'
        u.path === '/shares/c$/file.txt'
        u.fsPath === '\\server\c$\folder\file.txt'
    ```
     *
     * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
     * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
     * with URIs that represent files on disk (`file` scheme).
     */
    get fsPath(): string;

    // ---- modify to new -------------------------

    with(change: {
        scheme?: string;
        authority?: string | null;
        path?: string | null;
        query?: string | null;
        fragment?: string | null;
    }): URI;

    // ---- parse & validate ------------------------

    /**
     * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * @param value A string which represents an URI (see `URI#toString`).
     */
    static parse(value: string, _strict?: boolean): URI;

    /**
     * Creates a new URI from a file system path, e.g. `c:\my\files`,
     * `/usr/home`, or `\\server\share\some\path`.
     *
     * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
     * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
     * `URI.parse('file://' + path)` because the path might contain characters that are
     * interpreted (# and ?). See the following sample:
     * ```ts
    const good = URI.file('/coding/c#/project1');
    good.scheme === 'file';
    good.path === '/coding/c#/project1';
    good.fragment === '';
    const bad = URI.parse('file://' + '/coding/c#/project1');
    bad.scheme === 'file';
    bad.path === '/coding/c'; // path is now broken
    bad.fragment === '/project1';
    ```
     *
     * @param path A file system path (see `URI#fsPath`)
     */
    static file(path: string): URI;

    static from(components: {
        scheme: string;
        authority?: string;
        path?: string;
        query?: string;
        fragment?: string;
    }): URI;

    /**
     * Join a URI path with path fragments and normalizes the resulting path.
     *
     * @param uri The input URI.
     * @param pathFragment The path fragment to add to the URI path.
     * @returns The resulting URI.
     */
    static joinPath(uri: URI, ...pathFragment: string[]): URI;

    // ---- printing/externalize ---------------------------

    /**
     * Creates a string representation for this URI. It's guaranteed that calling
     * `URI.parse` with the result of this function creates an URI which is equal
     * to this URI.
     *
     * * The result shall *not* be used for display purposes but for externalization or transport.
     * * The result will be encoded using the percentage encoding and encoding happens mostly
     * ignore the scheme-specific encoding rules.
     *
     * @param skipEncoding Do not encode the result, default is `false`
     */
    toString(skipEncoding?: boolean): string;

    toJSON(): UriComponents;

    static revive(data: UriComponents | URI): URI;
    static revive(data: UriComponents | URI | undefined): URI | undefined;
    static revive(data: UriComponents | URI | null): URI | null;
    static revive(
        data: UriComponents | URI | undefined | null
    ): URI | undefined | null;
    static revive(
        data: UriComponents | URI | undefined | null
    ): URI | undefined | null;
}

export interface UriComponents {
    scheme: string;
    authority: string;
    path: string;
    query: string;
    fragment: string;
}

export interface IWebSocketFactory {
    create(url: string): IWebSocket;
}

export interface IWebSocket {
    readonly onData: Event<ArrayBuffer>;
    readonly onOpen: Event<void>;
    readonly onClose: Event<void>;
    readonly onError: Event<any>;

    send(data: ArrayBuffer | ArrayBufferView): void;
    close(): void;
}

export interface IResourceUriProvider {
    (uri: URI): URI;
}

export interface IStaticExtension {
    packageJSON: IExtensionManifest;
    extensionLocation: URI;
    isBuiltin?: boolean;
}

export interface ICommonTelemetryPropertiesResolver {
    (): { [key: string]: any };
}

export interface IExternalUriResolver {
    (uri: URI): Promise<URI>;
}

export interface ITunnelProvider {
    /**
     * Support for creating tunnels.
     */
    tunnelFactory?: ITunnelFactory;

    /**
     * Support for filtering candidate ports
     */
    showPortCandidate?: IShowPortCandidate;
}

export interface ITunnelFactory {
    (
        tunnelOptions: ITunnelOptions,
        tunnelCreationOptions: TunnelCreationOptions
    ): Promise<ITunnel> | undefined;
}

export interface ITunnelOptions {
    remoteAddress: { port: number; host: string };

    /**
     * The desired local port. If this port can't be used, then another will be chosen.
     */
    localAddressPort?: number;

    label?: string;
}

export interface TunnelCreationOptions {
    /**
     * True when the local operating system will require elevation to use the requested local port.
     */
    elevationRequired?: boolean;
}

export interface ITunnel extends IDisposable {
    remoteAddress: { port: number; host: string };

    /**
     * The complete local address(ex. localhost:1234)
     */
    localAddress: string;

    /**
     * Implementers of Tunnel should fire onDidDispose when dispose is called.
     */
    onDidDispose: Event<void>;
}

export interface IShowPortCandidate {
    (host: string, port: number, detail: string): Promise<boolean>;
}

export interface IWorkspaceCommand {
    /**
     * An identifier for the command. Commands can be executed from extensions
     * using the `vscode.commands.executeCommand` API using that command ID.
     */
    id: string;

    /**
     * A function that is being executed with any arguments passed over. The
     * return type will be send back to the caller.
     *
     * Note: arguments and return type should be serializable so that they can
     * be exchanged across processes boundaries.
     */
    handler: (...args: any[]) => unknown;
}

export interface IHomeIndicator {
    /**
     * The link to open when clicking the home indicator.
     */
    href: string;

    /**
     * The icon name for the home indicator. This needs to be one of the existing
     * icons from our Codicon icon set. For example `sync`.
     */
    icon: string;

    /**
     * A tooltip that will appear while hovering over the home indicator.
     */
    title: string;
}

export interface IWindowIndicator {
    /**
     * Triggering this event will cause the window indicator to update.
     */
    onDidChange: Event<void>;

    /**
     * Label of the window indicator may include octicons
     * e.g. `$(remote) label`
     */
    label: string;

    /**
     * Tooltip of the window indicator should not include
     * octicons and be descriptive.
     */
    tooltip: string;

    /**
     * If provided, overrides the default command that
     * is executed when clicking on the window indicator.
     */
    command?: string;
}

export enum ColorScheme {
    DARK = 'dark',
    LIGHT = 'light',
    HIGH_CONTRAST = 'hc',
}

export interface IInitialColorTheme {
    /**
     * Initial color theme type.
     */
    themeType: ColorScheme;

    /**
     * A list of workbench colors to apply initially.
     */
    colors?: { [colorId: string]: string };
}

export interface IDefaultSideBarLayout {
    visible?: boolean;
    containers?: (
        | {
              id:
                  | 'explorer'
                  | 'run'
                  | 'scm'
                  | 'search'
                  | 'extensions'
                  | 'remote'
                  | string;
              active: true;
              order?: number;
              views?: {
                  id: string;
                  order?: number;
                  visible?: boolean;
                  collapsed?: boolean;
              }[];
          }
        | {
              id:
                  | 'explorer'
                  | 'run'
                  | 'scm'
                  | 'search'
                  | 'extensions'
                  | 'remote'
                  | string;
              active?: false;
              order?: number;
              visible?: boolean;
              views?: {
                  id: string;
                  order?: number;
                  visible?: boolean;
                  collapsed?: boolean;
              }[];
          }
    )[];
}

export interface IDefaultPanelLayout {
    visible?: boolean;
    containers?: (
        | {
              id:
                  | 'terminal'
                  | 'debug'
                  | 'problems'
                  | 'output'
                  | 'comments'
                  | string;
              order?: number;
              active: true;
          }
        | {
              id:
                  | 'terminal'
                  | 'debug'
                  | 'problems'
                  | 'output'
                  | 'comments'
                  | string;
              order?: number;
              active?: false;
              visible?: boolean;
          }
    )[];
}

export interface IDefaultView {
    readonly id: string;
}

export interface IDefaultEditor {
    readonly uri: UriComponents;
    readonly openOnlyIfExists?: boolean;
    readonly openWith?: string;
}

export interface IDefaultLayout {
    readonly views?: IDefaultView[];
    readonly editors?: IDefaultEditor[];
}

export interface IProductQualityChangeHandler {
    /**
     * Handler is being called when the user wants to switch between
     * `insider` or `stable` product qualities.
     */
    (newQuality: 'insider' | 'stable'): void;
}

/**
 * Settings sync options
 */
export interface ISettingsSyncOptions {
    /**
     * Is settings sync enabled
     */
    readonly enabled: boolean;

    /**
     * Handler is being called when the user changes Settings Sync enablement.
     */
    enablementHandler?(enablement: boolean): void;
}

/**
 * A workspace to open in the workbench can either be:
 * - a workspace file with 0-N folders (via `workspaceUri`)
 * - a single folder (via `folderUri`)
 * - empty (via `undefined`)
 */
export type IWorkspace = { workspaceUri: URI } | { folderUri: URI } | undefined;

export interface IWorkspaceProvider {
    /**
     * The initial workspace to open.
     */
    readonly workspace: IWorkspace;

    /**
     * Arbitrary payload from the `IWorkspaceProvider.open` call.
     */
    readonly payload?: object;

    /**
     * Asks to open a workspace in the current or a new window.
     *
     * @param workspace the workspace to open.
     * @param options optional options for the workspace to open.
     * - `reuse`: whether to open inside the current window or a new window
     * - `payload`: arbitrary payload that should be made available
     * to the opening window via the `IWorkspaceProvider.payload` property.
     * @param payload optional payload to send to the workspace to open.
     */
    open(
        workspace: IWorkspace,
        options?: { reuse?: boolean; payload?: object }
    ): Promise<void>;
}

export interface ICredentialsProvider {
    getPassword(service: string, account: string): Promise<string | null>;
    setPassword(
        service: string,
        account: string,
        password: string
    ): Promise<void>;
    deletePassword(service: string, account: string): Promise<boolean>;
    findPassword(service: string): Promise<string | null>;
    findCredentials(
        service: string
    ): Promise<Array<{ account: string; password: string }>>;
}

export interface ICredentialsService extends ICredentialsProvider {
    readonly _serviceBrand: undefined;
    readonly onDidChangePassword: Event<void>;
}

export interface IURLCallbackProvider {
    /**
     * Indicates that a Uri has been opened outside of VSCode. The Uri
     * will be forwarded to all installed Uri handlers in the system.
     */
    readonly onCallback: Event<URI>;

    /**
     * Creates a Uri that - if opened in a browser - must result in
     * the `onCallback` to fire.
     *
     * The optional `Partial<UriComponents>` must be properly restored for
     * the Uri passed to the `onCallback` handler.
     *
     * For example: if a Uri is to be created with `scheme:"vscode"`,
     * `authority:"foo"` and `path:"bar"` the `onCallback` should fire
     * with a Uri `vscode://foo/bar`.
     *
     * If there are additional `query` values in the Uri, they should
     * be added to the list of provided `query` arguments from the
     * `Partial<UriComponents>`.
     */
    create(options?: Partial<UriComponents>): URI;
}

export interface IUpdate {
    version: string;
}

export interface IUpdateProvider {
    /**
     * Should return with the `IUpdate` object if an update is
     * available or `null` otherwise to signal that there are
     * no updates.
     */
    checkForUpdate(): Promise<IUpdate | null>;
}

export interface IBuiltInExtension {
    readonly name: string;
    readonly version: string;
    readonly repo: string;
    readonly metadata: any;
}

export type ConfigurationSyncStore = {
    web?: Partial<Omit<ConfigurationSyncStore, 'web'>>;
    url: string;
    insidersUrl: string;
    stableUrl: string;
    canSwitch: boolean;
    authenticationProviders: IStringDictionary<{ scopes: string[] }>;
};

export interface IProductConfiguration {
    readonly version: string;
    readonly date?: string;
    readonly quality?: string;
    readonly commit?: string;

    readonly nameShort: string;
    readonly nameLong: string;

    readonly win32AppUserModelId?: string;
    readonly win32MutexName?: string;
    readonly applicationName: string;

    readonly urlProtocol: string;
    readonly dataFolderName: string;

    readonly builtInExtensions?: IBuiltInExtension[];

    readonly downloadUrl?: string;
    readonly updateUrl?: string;
    readonly webEndpointUrl?: string;
    readonly target?: string;

    readonly settingsSearchBuildId?: number;
    readonly settingsSearchUrl?: string;

    readonly tasConfig?: {
        endpoint: string;
        telemetryEventName: string;
        featuresTelemetryPropertyName: string;
        assignmentContextTelemetryPropertyName: string;
    };

    readonly experimentsUrl?: string;

    readonly extensionsGallery?: {
        readonly serviceUrl: string;
        readonly itemUrl: string;
        readonly controlUrl: string;
        readonly recommendationsUrl: string;
    };

    readonly extensionTips?: { [id: string]: string };
    readonly extensionImportantTips?: IStringDictionary<ImportantExtensionTip>;
    readonly configBasedExtensionTips?: {
        [id: string]: IConfigBasedExtensionTip;
    };
    readonly exeBasedExtensionTips?: { [id: string]: IExeBasedExtensionTip };
    readonly remoteExtensionTips?: {
        [remoteName: string]: IRemoteExtensionTip;
    };
    readonly extensionKeywords?: { [extension: string]: readonly string[] };
    readonly keymapExtensionTips?: readonly string[];
    readonly trustedExtensionUrlPublicKeys?: { [id: string]: string[] };

    readonly crashReporter?: {
        readonly companyName: string;
        readonly productName: string;
    };

    readonly enableTelemetry?: boolean;
    readonly aiConfig?: {
        readonly asimovKey: string;
    };

    readonly sendASmile?: {
        readonly reportIssueUrl: string;
        readonly requestFeatureUrl: string;
    };

    readonly documentationUrl?: string;
    readonly releaseNotesUrl?: string;
    readonly keyboardShortcutsUrlMac?: string;
    readonly keyboardShortcutsUrlLinux?: string;
    readonly keyboardShortcutsUrlWin?: string;
    readonly introductoryVideosUrl?: string;
    readonly tipsAndTricksUrl?: string;
    readonly newsletterSignupUrl?: string;
    readonly twitterUrl?: string;
    readonly requestFeatureUrl?: string;
    readonly reportIssueUrl?: string;
    readonly licenseUrl?: string;
    readonly privacyStatementUrl?: string;
    readonly telemetryOptOutUrl?: string;

    readonly npsSurveyUrl?: string;
    readonly surveys?: readonly ISurveyData[];

    readonly checksums?: { [path: string]: string };
    readonly checksumFailMoreInfoUrl?: string;

    readonly appCenter?: IAppCenterConfiguration;

    readonly portable?: string;

    readonly extensionKind?: {
        readonly [extensionId: string]: ExtensionKind[];
    };
    readonly extensionAllowedProposedApi?: readonly string[];

    readonly msftInternalDomains?: string[];
    readonly linkProtectionTrustedDomains?: readonly string[];

    readonly 'configurationSync.store'?: ConfigurationSyncStore;
}

/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are strings.
 */
export type IStringDictionary<V> = Record<string, V>;

/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are numbers.
 */
export type INumberDictionary<V> = Record<number, V>;

export type ImportantExtensionTip = {
    name: string;
    languages?: string[];
    pattern?: string;
    isExtensionPack?: boolean;
};

export interface IAppCenterConfiguration {
    readonly 'win32-ia32': string;
    readonly 'win32-x64': string;
    readonly 'linux-x64': string;
    readonly darwin: string;
}

export interface IConfigBasedExtensionTip {
    configPath: string;
    configName: string;
    recommendations: IStringDictionary<{
        name: string;
        remotes?: string[];
        important?: boolean;
        isExtensionPack?: boolean;
    }>;
}

export interface IExeBasedExtensionTip {
    friendlyName: string;
    windowsPath?: string;
    important?: boolean;
    recommendations: IStringDictionary<{
        name: string;
        important?: boolean;
        isExtensionPack?: boolean;
    }>;
}

export interface IRemoteExtensionTip {
    friendlyName: string;
    extensionId: string;
}

export interface ISurveyData {
    surveyId: string;
    surveyUrl: string;
    languageId: string;
    editCount: number;
    userProbability: number;
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

export interface ICommand {
    command: string;
    title: string;
    category?: string;
}

export interface IConfigurationProperty {
    description: string;
    type: string | string[];
    default?: any;
}

export interface IConfiguration {
    properties: { [key: string]: IConfigurationProperty };
}

export interface IDebugger {
    label?: string;
    type: string;
    runtime?: string;
}

export interface IGrammar {
    language: string;
}

export interface IJSONValidation {
    fileMatch: string | string[];
    url: string;
}

export interface IKeyBinding {
    command: string;
    key: string;
    when?: string;
    mac?: string;
    linux?: string;
    win?: string;
}

export interface ILanguage {
    id: string;
    extensions: string[];
    aliases: string[];
}

export interface IMenu {
    command: string;
    alt?: string;
    when?: string;
    group?: string;
}

export interface ISnippet {
    language: string;
}

export interface ITheme {
    label: string;
}

export interface IViewContainer {
    id: string;
    title: string;
}

export interface IView {
    id: string;
    name: string;
}

export interface IColor {
    id: string;
    description: string;
    defaults: { light: string; dark: string; highContrast: string };
}

export interface IWebviewEditor {
    readonly viewType: string;
    readonly priority: string;
    readonly selector: readonly {
        readonly filenamePattern?: string;
    }[];
}

export interface ICodeActionContributionAction {
    readonly kind: string;
    readonly title: string;
    readonly description?: string;
}

export interface ICodeActionContribution {
    readonly languages: readonly string[];
    readonly actions: readonly ICodeActionContributionAction[];
}

export interface IAuthenticationContribution {
    readonly id: string;
    readonly label: string;
}

export interface IExtensionContributions {
    commands?: ICommand[];
    configuration?: IConfiguration | IConfiguration[];
    debuggers?: IDebugger[];
    grammars?: IGrammar[];
    jsonValidation?: IJSONValidation[];
    keybindings?: IKeyBinding[];
    languages?: ILanguage[];
    menus?: { [context: string]: IMenu[] };
    snippets?: ISnippet[];
    themes?: ITheme[];
    iconThemes?: ITheme[];
    viewsContainers?: { [location: string]: IViewContainer[] };
    views?: { [location: string]: IView[] };
    colors?: IColor[];
    localizations?: ILocalization[];
    readonly customEditors?: readonly IWebviewEditor[];
    readonly codeActions?: readonly ICodeActionContribution[];
    authentication?: IAuthenticationContribution[];
}

export type ExtensionKind = 'ui' | 'workspace' | 'web';

export interface IExtensionManifest {
    readonly name: string;
    readonly displayName?: string;
    readonly publisher: string;
    readonly version: string;
    readonly engines: { vscode: string };
    readonly description?: string;
    readonly main?: string;
    readonly browser?: string;
    readonly icon?: string;
    readonly categories?: string[];
    readonly keywords?: string[];
    readonly activationEvents?: string[];
    readonly extensionDependencies?: string[];
    readonly extensionPack?: string[];
    readonly extensionKind?: ExtensionKind | ExtensionKind[];
    readonly contributes?: IExtensionContributions;
    readonly repository?: { url: string };
    readonly bugs?: { url: string };
    readonly enableProposedApi?: boolean;
    readonly api?: string;
    readonly scripts?: { [key: string]: string };
}

export interface ILocalization {
    languageId: string;
    languageName?: string;
    localizedLanguageName?: string;
    translations: ITranslation[];
    minimalTranslations?: { [key: string]: string };
}

export interface ITranslation {
    id: string;
    path: string;
}

/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
export interface Event<T> {
    (
        listener: (e: T) => any,
        thisArgs?: any,
        disposables?: IDisposable[] | DisposableStore
    ): IDisposable;
}
