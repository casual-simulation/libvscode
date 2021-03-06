const fs = require('fs');
const path = require('path');
const { checkFileExists, execFile } = require('./util.cjs');

async function bootstrap() {
    const extensionsPath = path.resolve(__dirname, '..', 'extensions');
    const extensions = await fs.promises.readdir(extensionsPath);

    console.log('Installing extension packages...');
    for (let extension of extensions) {
        const dir = path.resolve(extensionsPath, extension);
        if (await checkFileExists(path.join(dir, 'package.json'))) {
            await execFile('yarn', ['--frozen-lockfile'], { cwd: dir });
        }
    }
    console.log('Done.');

    const lib = path.resolve(__dirname, '..', 'lib');
    const vscode = path.resolve(lib, 'vscode');
    if (!(await checkFileExists(vscode))) {
        console.log('Downloading vscode...');
        await fs.promises.mkdir(lib, { recursive: true });
        await execFile(
            'git',
            [
                'clone',
                '--depth',
                '1',
                '-b',
                '1.52.1',
                'https://github.com/microsoft/vscode.git',
                'vscode',
            ],
            {
                cwd: lib,
                shell: true,
            }
        );
        console.log('Done.');

        console.log('Installing vscode packages...');
        await execFile('yarn', ['--frozen-lockfile'], { cwd: vscode });
        console.log('Done.');
    }
}

module.exports = {
    bootstrap,
};
