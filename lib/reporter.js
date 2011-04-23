/*jslint forin: true */

var log = console.log;

exports.report = function(file, lint) {
    log("\n" + file);

    var options = [], key, value,
        i, len, pad, e;

    for (key in lint.options) {
        value = lint.options[key];
        options.push(key + ": " + value);
    }
    log("/*jslint " + options.join(", ") + " */");

    if (!lint.ok) {
        len = lint.errors.length;
        for (i=0; i<len; i++) {
            pad = String(i + 1);
            while (pad.length < 3) {
                pad = ' ' + pad;
            }
            e = lint.errors[i];
            if (e) {
                log(pad + ' ' + e.line + ',' + e.character + ': ' + e.reason);
                log( '    ' + (e.evidence || '').replace(/^\s+|\s+$/, ""));
            }
        }
    } else {
        log("No errors found.");
    }

    return lint.ok;
};
