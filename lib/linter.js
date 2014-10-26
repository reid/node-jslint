'use strict';

var JSLINT = require('./jslint');

function preprocessScript(script) {
    // Fix UTF8 with BOM.
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }

    // Remove shebang, replacing it with an empty line.
    /*jslint regexp: true */
    script = script.replace(/^\#\!.*/, '');
    /*jslint regexp: false */

    return script;
}
exports.preprocessScript = preprocessScript;

exports.doLint = function (script, options) {
    var ok,
        result;

    script = preprocessScript(script);

    ok = JSLINT(script, options || {});

    result = JSLINT.data();
    result.ok = ok;
    result.options = options;

    return result;
};
