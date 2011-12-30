/*jslint forin: true */

var color = require("./color");
var log = console.log;

exports.report = function (file, lint, colorize, format) {
    'use strict';
    if (typeof(format) == 'undefined') {
        format = 'default';
    }

    var options = [], key, value, line,
        i, len, pad, e, fileMessage, errors = [];

    for (key in lint.options) {
        value = lint.options[key];
        options.push(key + ": " + value);
    }

    if (!lint.ok) {
        len = lint.errors.length;
        for (i = 0; i < len; i += 1) {
            e = lint.errors[i];
            if (e) {
                errors.push({
                    line: e.line,
                    pos: e.character,
                    error: e.reason,
                    code: (e.evidence || '').replace(/^\s+|\s+$/, "")
                });
            }
        }
    } else {
        log(fileMessage + " is " + ((colorize) ? color.green('OK') : 'OK') + ".");
    }

    if (errors.length > 0) {
        if (format == 'default') {
            fileMessage = "\n" + ((colorize) ? color.bold(file) : file);
            log(fileMessage);
            for (var i=0; i < errors.length; i++) {
                var error = errors[i];
                pad = "#" + String(i + 1);
                while (pad.length < 3) {
                    pad = ' ' + pad;
                }
                line = " // Line " + error.line + ", Pos " + error.pos;
                log(pad + ' ' + ((colorize) ? color.yellow(error.error) : error.error));
                log('    ' + error.code + ((colorize) ? color.grey(line) : line));
            }
        }
    }

    return lint.ok;
};
