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
    try {
        const result = await exec(file, args, {
            stdio: 'inherit',
            shell: true,
            ...(options || {})
        });

        process.stdout.write(result.stdout);
        process.stderr.write(result.stderr);
        return result;
    } catch (err) {
        process.stdout.write(err.stdout);
        process.stderr.write(err.stderr);
        throw err;
    }
}

module.exports = {
    checkFileExists,
    execFile,
};