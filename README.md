# libvscode

A static build of VSCode that can be used to include it in other projects.

This project is a fork of [github1s](https://github.com/conwnet/github1s) that packages the the results and provides additional mechanisms for runtime configuration.

## Usage

1. Install libvscode:
```
$ npm install @casual-simulation/libvscode
```
2. Copy the libvscode dist folder to a publicly accessible path.
    -   This can be anywhere, you just have to specify where it is during init.
    -   For now, we're going to assume that it is available at `/vscode`.
3. Import and initialize:
```javascript
import { initVSCode } from '@casual-simulation/libvscode';

async function main() {
    await initVSCode({
        container: document.body,
        publicPath: '/vscode',
    });
}

main();
```

### Custom Features
Here are some extra features that have been added to VSCode to make integration easier:

#### fetchBuiltinExtensions(publicPath)

Fetches the list of builtin extensions from the given public path.
You can use this function to get the list of builtin extensions and override any you want. Returns a promise.

#### self.registerMessagePort(name, port)

Extensions have access to a special function (`self.registerMessagePort()`) which lets them send a message port back to the host to enable custom messaging.
In order for this to work, you have to define your own `registerMessagePort(name, port)` function on `globalThis.vscode` before `initVSCode()` is called.

## Developing

To bootstrap this project, do the following steps:

1. Install NPM dependencies
```
$ yarn
```
2. Bootstrap the project.
```
$ yarn bootstrap
```