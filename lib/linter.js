var JSLINT = require("../lib/jslint");

function addDefaults(options) {
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

exports.lint = function(script, options) {
    // remove shebang
    script = script.replace(/^\#\!.*/, "");

    options = options || {};
    delete options.argv;
    options = addDefaults(options);

    var ok = JSLINT(script, options);

    var result = {
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
