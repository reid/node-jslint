/*jslint forin: true */

var log = console.log;

exports.report = function(file, lint) {
    log(file);

    var options = [];
    for (var key in lint.options) {
        var value = lint.options[key];
        options.push(key + ": " + value);
    }
    log("/*jslint " + options.join(", ") + "*/");

    if (!lint.ok) {
        var i, len, pad, e;
        len = lint.errors.length;
        for (i=0; i<len; i++) {
            pad = '' + (i + 1);
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
        log("ok!");
    }

    return lint.ok;
};
