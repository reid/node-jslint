/*jslint forin: true */

var color = require("./color");
var log = console.log;

exports.report = function(file, lint, opt) {

    var options = [], key, value, line,
        i, len, pad, e, fileMessage = "\n" + ((opt.boring)? file: color.bold(file));

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
                line = ' // Line ' + e.line + ', Pos ' + e.character;
                
                log(pad + ' ' + ((opt.boring)? e.reason: color.yellow(e.reason)));
                log( '    ' + (e.evidence || '').replace(/^\s+|\s+$/, "") +
                        ((opt.boring)? line: color.grey(line)));
            }
        }
    } else {
        log(fileMessage + " is " + ((opt.boring)? 'OK': color.green('OK')) + ".");
    }

    return lint.ok;
};
