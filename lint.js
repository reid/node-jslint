// jslint wrapper for nodejs
// Adapted from rhino.js. Copyright 2002 Douglas Crockford

/*global JSLINT, process, require */
/*jslint rhino: true, strict: false */

(function (file) {
    var e,
        i,
        input,
        sys = require("sys"),
        posix = require("posix");

    if (!file) {
        sys.puts("Usage: jslint.js file.js");
        process.exit(1);
    }

    eval(posix.cat("./jslint.com-mirror/www.jslint.com/fulljslint.js").wait());

    input = posix.cat(file).wait();
    if (!input) {
        sys.puts("jslint: Couldn't open file '" + file + "'.");
        process.exit(1);
    }

    if (!JSLINT(input, {bitwise: true, eqeqeq: true, immed: true,
            newcap: true, nomen: true, onevar: true, plusplus: true,
            regexp: true, rhino: true, undef: true, white: true})) {
        for (i = 0; i < JSLINT.errors.length; i += 1) {
            e = JSLINT.errors[i];
            if (e) {
                sys.puts('Lint at line ' + e.line + ' character ' +
                        e.character + ': ' + e.reason);
                sys.puts((e.evidence || '').
                        replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
                sys.puts('');
            }
        }
        process.exit(2);
    }

    sys.puts("jslint: No problems found in " + file);
}(process.ARGV[2]));
