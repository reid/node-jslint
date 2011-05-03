/*jslint forin: true */

var color = require("./color");
var log = console.log;

exports.report = function(file, lint) {

    var options = [], key, value,
        i, len, pad, e, fileMessage = "\n" + color.bold(file);

    for (key in lint.options) {
        value = lint.options[key];
        options.push(key + ": " + value);
    }

    if (!lint.ok) {
        log(fileMessage);
        len = lint.errors.length;
        for (i=0; i<len; i++) {
            pad = "#" + String(i + 1);
            while (pad.length < 3) {
                pad = ' ' + pad;
            }
            e = lint.errors[i];
            if (e) {
                log(pad + ' ' + color.yellow(e.reason));
                log( '    ' + (e.evidence || '').replace(/^\s+|\s+$/, "") +
                        color.grey(' // Line ' + e.line + ', Pos ' + e.character));
            }
        }
    } else {
        log(fileMessage + " is " + color.green("OK") + ".");
    }

    return lint.ok;
};
