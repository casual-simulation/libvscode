const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');
const path = require('path');
const fs = require('fs');

async function buildEntry() {
    const initialSource = await fs.promises.readFile(
        path.resolve(__dirname, '../../src/libvscode/loader.js'),
        'utf8'
    );
    const loaderSource = await fs.promises.readFile(
        path.resolve(__dirname, '../../lib/vscode/out-vscode-min/vs/loader.js'),
        'utf8'
    );
    const distFolder = path.resolve(__dirname, '../../dist');
    const distFolders = await fs.promises.readdir(distFolder);
    const staticFolder = distFolders.find(f => /^static/.test(f));

    const finalLoaderSource = initialSource + loaderSource;
    await fs.promises.mkdir(path.resolve(__dirname, '../../dist', staticFolder), {
        recursive: true,
    });
    await fs.promises.writeFile(
        path.resolve(__dirname, '../../dist', staticFolder, 'loader.js'),
        finalLoaderSource,
        'utf8'
    );

    const indexPath = path.resolve(__dirname, '../../src/libvscode/index.ts');

    await esbuild.build({
        entryPoints: [indexPath],
        plugins: [],
        bundle: true,
        outdir: path.resolve(__dirname, '../../dist/'),
        target: 'es2020',
        format: 'esm',
        minify: true,
        sourcemap: true,
        define: {
            VSCODE_VERSION_HASH: JSON.stringify(staticFolder)
        }
    });

    await esbuild.build({
        entryPoints: [path.resolve(__dirname, '../../src/libvscode/test.js')],
        plugins: [
            alias({
                libvscode: path.resolve(
                    __dirname,
                    '../../dist',
                    'index.js'
                ),
            }),
        ],
        bundle: true,
        outdir: path.resolve(__dirname, '../../dist/test/'),
        target: 'es2020',
        format: 'iife',
        minify: true,
        sourcemap: true,
    });

    await fs.promises.copyFile(
        path.resolve(__dirname, '../../src/libvscode/index.d.ts'),
        path.resolve(__dirname, '../../dist/index.d.ts')
    );
}

module.exports = {
    buildEntry
};
