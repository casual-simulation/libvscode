const plugin = {
    name: 'injectPlugin',
    setup(build) {
        let fs = require('fs')

        // Load ".txt" files and return an array of words
        build.onLoad({ filter: /vs\/loader\.js$/ }, async (args) => {
            let text = await fs.promises.readFile(args.path, 'utf8');
            let shim = `module = undefined;${text}`;
            let contents = text.startsWith('"use strict";') ? 
                text.slice(0, '"use strict";'.length) + shim + text.slice('"use strict";'.length) :
                shim + text;
            return {
                contents: contents,
                loader: 'js',
            }
        })
    },
};

module.exports = plugin;