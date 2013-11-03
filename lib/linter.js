/*jslint stupid: true*/
var JSLINT,
    path = require('path'),
    fs = require('fs');

function loadAndParseConfig(filePath) {
    'use strict';
    return fs.existsSync(filePath) ?
            JSON.parse(fs.readFileSync(filePath, "utf-8")) : {};
}

function merge(source, add) {
    'use strict';

    var result = source,
        prop;

    for (prop in add) {
        if (add.hasOwnProperty(prop)) {
            if (!result.hasOwnProperty(prop)) {
                result[prop] = add[prop];
            }
        }
    }

    return result;
}
exports.merge = merge;

function mergeConfigs(homerc) {
    'use strict';
    var homeConfig = loadAndParseConfig(homerc),
        args = [].concat(arguments),
        cwdrcs = args.slice(1),
        cwdConfig = loadAndParseConfig(cwdrcs[0]) || loadAndParseConfig(cwdrcs[1]),
        config;


    config = merge(cwdConfig, homeConfig);

    return config;
}

function loadConfig() {
    'use strict';

    var home = process.env.HOME || '',
        defaultConfig = path.join(home, '.jslintrc'),
        projectConfig = path.join(process.cwd(), 'jslintrc'),
        projectConfigDot = path.join(process.cwd(), '.jslintrc'),
        config = mergeConfigs(defaultConfig, projectConfig, projectConfigDot);

    return config;
}

function addDefaults(options, config) {
    'use strict';
    options = merge(options, config);

    ['node', 'es5'].forEach(function (opt) {
        if (!options.hasOwnProperty(opt)) {
            options[opt] = true;
        }
    });
    return options;
}
exports.addDefaults = addDefaults;

function splitPredefs(options) {
    'use strict';

    if (options.predef && !Array.isArray(options.predef)) {
        options.predef = options.predef.split(',')
            .filter(function (n) { return !!n; });
    }

    return options;
}
exports.splitPredefs = splitPredefs;

function loadJSLint(options) {
    'use strict';

    return require("../lib/nodelint")(options.edition);
}

exports.lint = function (script, options) {
    'use strict';
    var config = loadConfig(),
        ok,
        result;

    JSLINT = JSLINT || loadJSLint(options);

    // Fix UTF8 with BOM
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }

    // remove shebang
    /*jslint regexp: true*/
    script = script.replace(/^\#\!.*/, "");
    /*jslint regexp: false*/

    options = options || {};
    delete options.argv;

    options = addDefaults(options, config);

    options = splitPredefs(options);

    ok = JSLINT(script, options);
    result = {
        ok: true,
        errors: []
    };

    if (!ok) {
        result = JSLINT.data();
        result.ok = ok;
    }

    result.options = options;

    return result;
};
