/*jslint stupid: true*/
var JSLINT,
    path = require('path'),
    nodelint = require('../lib/nodelint'),
    fs = require('fs'),
    con = console;

exports.setConsole = function (c) {
    'use strict';
    con = c;
};

function loadAndParseConfig(filePath) {
    'use strict';
    var config;

    try {
        config = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
        if (filePath && err.code !== "ENOENT") {
            con.warn('Error reading config file "' + filePath + '": ' + err);
        }
    }

    return config;
}
exports.loadAndParseConfig = loadAndParseConfig;

function merge(source, add) {
    'use strict';

    var result = source || {},
        prop;

    if (!add) {
        return result;
    }

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
        args = Array.prototype.slice.call(arguments),
        cwdrcs = args.slice(1),
        cwdConfig,
        config;

    cwdConfig = loadAndParseConfig(cwdrcs[0]) || loadAndParseConfig(cwdrcs[1]);
    config = merge(cwdConfig, homeConfig);

    return config;
}
exports.mergeConfigs = mergeConfigs;

function loadConfig(h) {
    'use strict';

    var home = h || '',
        defaultConfig = path.join(home, '.jslintrc'),
        projectConfig = path.join(process.cwd(), 'jslintrc'),
        projectConfigDot = path.join(process.cwd(), '.jslintrc'),
        config = mergeConfigs(defaultConfig, projectConfig, projectConfigDot);

    return config;
}
exports.loadConfig = loadConfig;

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

    return nodelint.load(options.edition);
}
exports.loadJSLint = loadJSLint;

function preprocessOptions(options, config) {
    'use strict';

    options = options || {};
    delete options.argv;

    options = addDefaults(options, config);

    options = splitPredefs(options);

    return options;
}
exports.preprocessOptions = preprocessOptions;

function preprocessScript(script) {
    'use strict';

    // Fix UTF8 with BOM
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }

    // remove shebang: replace it with empty line
    /*jslint regexp: true*/
    script = script.replace(/^\#\!.*/, "");
    /*jslint regexp: false*/

    return script;
}
exports.preprocessScript = preprocessScript;

exports.lint = function (script, options) {
    'use strict';
    var config = loadConfig(process.env.HOME),
        ok,
        result;

    options = preprocessOptions(options, config);

    JSLINT = JSLINT || loadJSLint(options);

    script = preprocessScript(script);

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
