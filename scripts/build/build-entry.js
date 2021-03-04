const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');
const path = require('path');
const fs = require('fs')

async function main() {
	const initialSource = await fs.promises.readFile(
		path.resolve(__dirname, '../../src/libvscode/loader.js'),
		'utf8'
	);
	const loaderSource = await fs.promises.readFile(
		path.resolve(__dirname, '../../lib/vscode/out-vscode/vs/loader.js'),
		'utf8'
	);

	const finalLoaderSource = initialSource + loaderSource;
	await fs.promises.writeFile(path.resolve(__dirname, '../../dist/static/loader.js'), finalLoaderSource, 'utf8');

	await esbuild.build({
		entryPoints: [path.resolve(__dirname, '../../src/libvscode/index.ts')],
		plugins: [],
		bundle: true,
		outfile: path.resolve(__dirname, '../../dist/static/index.js'),
		target: 'es2020',
		format: 'esm'
	});

	await esbuild.build({
		entryPoints: [path.resolve(__dirname, '../../src/libvscode/test.js')],
		plugins: [
			alias({
				'libvscode': path.resolve(__dirname, '../../dist/static/index.js'),
			})
		],
		bundle: true,
		outfile: path.resolve(__dirname, '../../dist/test/index.js'),
		target: 'es2020',
		format: 'iife'
	});
}

main();