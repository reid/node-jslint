'use strict';

var editions = [
    '2012-02-03',
    '2013-02-03',
    '2013-08-13',
    '2013-09-22',
    '2013-11-23',
    '2014-01-26',
    '2014-02-06',
    '2014-04-21',
    '2014-07-08'
],
    defaultEdition = editions[editions.length - 1],
    path = require('path');

exports.editions = editions;
exports.defaultEdition = defaultEdition;

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
    options = options || {};

    var edition = options.edition || defaultEdition,
        jslintPath = './' + path.join('editions', edition),
        JSLINT = require(jslintPath),
        ok,
        result;

    script = preprocessScript(script);

    ok = JSLINT(script, options);

    result = JSLINT.data();
    result.ok = ok;
    result.options = options;

    return result;
};
