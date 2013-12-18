(function () {
    'use strict';

    function generator(o, f) {
        return function (s) {
            o[f](s);
        };
    }
    exports.generator = generator;

    var color = require("./color"),
        logger = {
            log: generator(console, 'log'),
            err: generator(process.stderr, 'write')
        };

    exports.setLogger = function (l) {
        logger = l;
    };

    exports.report = function (file, lint, colorize, terse) {
        var line, i, len, pad, e, fileMessage;

        fileMessage = "\n" + (colorize ? color.bold(file) : file);

        if (!lint.ok) {
            if (terse) {
                len = lint.errors.length;
                for (i = 0; i < len; i += 1) {
                    e = lint.errors[i];
                    if (e) {
                        logger.log(file + ':' + e.line + ':' + e.character + ': ' + e.reason);
                    }
                }
            } else {
                logger.log(fileMessage);
                len = lint.errors.length;
                for (i = 0; i < len; i += 1) {
                    pad = "#" + String(i + 1);
                    while (pad.length < 3) {
                        pad = ' ' + pad;
                    }
                    e = lint.errors[i];
                    if (e) {
                        line = ' // Line ' + e.line + ', Pos ' + e.character;

                        logger.log(pad + ' ' + (colorize ? color.yellow(e.reason) : e.reason));
                        logger.log('    ' + (e.evidence || '').replace(/^\s+|\s+$/, "") +
                                   (colorize ? color.grey(line) : line));
                    }
                }
            }
        } else {
            if (terse) {
                logger.err(".");
            } else {
                logger.log(fileMessage + " is " + (colorize ? color.green('OK') : 'OK') + ".");
            }
        }

        return lint.ok;
    };

}());
