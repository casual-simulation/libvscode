const gulp = require('gulp');
const { bootstrap } = require('./scripts/bootstrap.cjs');
const { checkFileExists, execFile } = require('./scripts/util.cjs');
const { main: copyExtensions } = require('./scripts/package/copy-extensions.cjs');
const { main: generateConfig } = require('./scripts/package/generate-config.cjs');
const path = require('path');
const fs = require('fs');
const del = require('del');
const { buildEntry } = require('./scripts/build/build-entry.cjs');

const vscode = path.resolve(__dirname, 'lib', 'vscode');

gulp.task('bootstrap', async () => {
    await bootstrap();
});

gulp.task('package:vscode', async () => {
    return gulp
        .src('./lib/vscode/out-vscode-min/**')
        .pipe(gulp.dest('./dist/static/vscode/'));
});

gulp.task('package:builtin-extensions', async () => {
    const extension = path.resolve(
        __dirname,
        'lib',
        'vscode',
        'extensions',
        'emmet',
        'dist',
        'browser'
    );
    if (!(await checkFileExists(extension))) {
        await execFile('yarn', ['gulp', 'compile-web'], { cwd: vscode });
    }
});

gulp.task(
    'package:extensions',
    gulp.series('package:builtin-extensions', async () => {
        await copyExtensions();
    })
);

const deps = [
    'vscode-textmate',
    'vscode-oniguruma',
    'xterm',
    'xterm-addon-search',
    'xterm-addon-unicode11',
    'xterm-addon-webgl',
    'tas-client-umd',
    'iconv-lite-umd',
    'jschardet',
];

gulp.task(
    'package:node-modules',
    gulp.parallel(
        deps.map((d) => () => {
            return gulp
                .src(`./lib/vscode/node_modules/${d}/**/*`)
                .pipe(gulp.dest(`./dist/static/node_modules/${d}/`));
        })
    )
);

gulp.task('package:resources', async () => {
    return gulp.src(['./resources/test.html']).pipe(gulp.dest('./dist'));
});

gulp.task('package:config', async () => {
    await generateConfig();
});

gulp.task('hash', async () => {
    await sleep(100);
    const { stdout } = await execFile('git', ['rev-parse', 'HEAD']);
    const commitId = stdout.slice(0, 7);
    const staticFolderName = `static-${commitId}`;

    await fs.promises.rename('./dist/static', `./dist/${staticFolderName}`);
});

gulp.task('build:vscode:sync', async () => {
    return gulp.src('./src/vscode/**/*').pipe(gulp.dest('./lib/vscode/src/'));
});

gulp.task('build:vscode:copy', async () => {
    return gulp
        .src('./resources/gulp-vscode-extra.js')
        .pipe(gulp.dest('./lib/vscode/'));
});

gulp.task('build:vscode:gulp', async () => {
    await execFile('yarn', ['gulp', 'compile-build'], { cwd: vscode });
    await execFile(
        'yarn',
        ['gulp', 'optimize', '--gulpfile', './gulp-vscode-extra.js'],
        { cwd: vscode }
    );
    await execFile(
        'yarn',
        ['gulp', 'minify', '--gulpfile', './gulp-vscode-extra.js'],
        { cwd: vscode }
    );
});

gulp.task(
    'build:vscode',
    gulp.series('build:vscode:sync', 'build:vscode:copy', 'build:vscode:gulp')
);

gulp.task('build:extensions', async () => {
    for (let dir of await fs.promises.readdir('./extensions')) {
        if (await checkFileExists(path.join(dir, 'package.json'))) {
            await execFile('yarn', ['compile'], { cwd: dir });
        }
    }
});

gulp.task('build:entry', async () => {
    await sleep(100);
    await buildEntry();
});

gulp.task(
    'package',
    gulp.parallel(
        'package:vscode',
        'package:extensions',
        'package:node-modules',
        'package:resources',
        'package:config'
    )
);

gulp.task('clean', async () => {
    return del('./dist/**');
});

gulp.task(
    'build',
    gulp.series(
        'clean',
        'build:vscode',
        'build:extensions',
        'package',
        'hash',
        'build:entry'
    )
);

function sleep(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
