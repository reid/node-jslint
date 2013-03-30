var JSLINT = require("../lib/nodelint"),
    path = require("path"),
    fs = require("fs");


function removeJsComments(str) {
    'use strict';
    str = str || '';
    str = str.replace(/\/\*[\s\S]*(?:\*\/)/g, ''); //everything between "/* */"
    str = str.replace(/\/\/[^\n\r]*/g, ''); //everything after "//"
    return str;
}

function loadAndParseConfig(filePath) {
    'use strict';
    return path.existsSync(filePath) ?
            JSON.parse(removeJsComments(fs.readFileSync(filePath, "utf-8"))) : {};
}

function mergeConfigs(homerc, cwdrc) {
    'use strict';
    var homeConfig = loadAndParseConfig(homerc),
        cwdConfig = loadAndParseConfig(cwdrc),
        prop;

    for (prop in cwdConfig) {
        if (typeof prop === 'string') {
            homeConfig[prop] = cwdConfig[prop];
        }
    }

    return homeConfig;
}

function addDefaults(options) {
    'use strict';
    var defaultConfig = path.join(process.env.HOME, '.jslintrc'),
    projectConfig = path.join(process.cwd(), 'jslintrc'),
    config = mergeConfigs(defaultConfig, projectConfig),
    opt;
    for (opt in config) {
        if (typeof opt === 'string') {
            if (!options.hasOwnProperty(opt)) {
                options[opt] = config[opt];
            }
        }
    }
    ['node', 'es5'].forEach(function (opt) {
        if (!options.hasOwnProperty(opt)) {
            options[opt] = true;
        }
    });
    return options;
}

exports.lint = function (script, options) {
    'use strict';
 
    // Fix UTF8 with BOM
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }

    // remove shebang
    /*jslint regexp: true*/
    script = script.replace(/^\#\!.*/, "");

    options = options || {};
    delete options.argv;
    options = addDefaults(options);

    if (options.predef && !Array.isArray(options.predef)) {
        options.predef = options.predef.split(',')
            .filter(function (n) { return !!n; });
    }

    var ok = JSLINT(script, options),
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
