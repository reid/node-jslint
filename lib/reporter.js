/*jslint forin: true */

var color = require("./color");
var log = console.log;

exports.report = function (file, lint, colorize, terse, quiet, tracker) {
    'use strict';

    var options = [], key, value, line,
        i, len, pad, e, errors,
        fileMessage, okMessage, errorMessage;

    for (key in lint.options) {
        value = lint.options[key];
        options.push(key + ": " + value);
    }

    fileMessage = ((colorize) ? color.bold(file) : file);
    okMessage = terse ? ((colorize) ? color.green('ok  ') : 'ok  ') : ((colorize) ? color.green(' ok') : ' ok') + "\t";
    errorMessage = terse ? ((colorize) ? color.red('err ') : 'err ') : ((colorize) ? color.red(' error') : ' error');

    if (quiet) {
        errors = false;
    } else {
        errors = tracker.results[tracker.results.length - 1];
    }

    if (!lint.ok) {
        if (terse) {
            len = lint.errors.length;
            for (i = 0; i < len; i += 1) {
                e = lint.errors[i];
                if (e) {
                    log((quiet ? '' : errorMessage) + fileMessage + ((colorize) ? color.grey(':' + e.line + ' ') : ':' + e.line + ' ') + ((colorize) ? color.yellow(e.reason) : e.reason));
                }
            }
        } else {
            log((tracker.total > 1 && errors ? '\n' : '') + errorMessage + '\t' + fileMessage);
            len = lint.errors.length;
            for (i = 0; i < len; i += 1) {
                pad = ((colorize) ? color.grey(' #') : ' #') + String(i + 1);
                while (pad.length < 3) {
                    pad = ' ' + pad;
                }
                e = lint.errors[i];
                if (e) {
                    line = ' // Line ' + e.line + ', Pos ' + e.character;

                    log(pad + '\t' + ((colorize) ? color.yellow(e.reason) : e.reason));
                    log('\t' + (e.evidence || '').replace(/^\s+|\s+$/, "") +
                            ((colorize) ? color.grey(line) : line));
                }
            }
            if (tracker.total > 1) {
                log('');
            }
        }
    } else {
        if (!quiet) {
            log(okMessage + fileMessage);
        }
    }

    return lint.ok;
};
