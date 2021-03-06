const child_process = require('child_process');
const { promisify } = require('util');
const exec = promisify(child_process.execFile);
const fs = require('fs');

async function checkFileExists(file) {
    return fs.promises.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

async function execFile(file, args, options) {
    const result = await exec(file, args, {
        stdio: 'inherit',
        shell: true,
        ...(options || {})
    });

    console.log(result.stdout.toString('utf-8'));
    console.log(result.stderr.toString('utf-8'));
    return result;
}

module.exports = {
    checkFileExists,
    execFile,
};