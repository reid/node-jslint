var JSLINT = require("../lib/jslint");

function addDefaults(options) {
    'use strict';
    ['node', 'es5'].forEach(function (opt) {
        if (!options.hasOwnProperty(opt)) {
            options[opt] = true;
        }
    });
    if (options.goodparts) {
        ['white', 'onevar', 'undef', 'nomen', 'regexp',
            'plusplus', 'bitwise', 'newcap'].forEach(function (goodpart) {
            if (!options.hasOwnProperty(goodpart)) {
                options[goodpart] = true;
            }
        });
    }
    return options;
}

exports.lint = function (script, options) {
    'use strict';
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