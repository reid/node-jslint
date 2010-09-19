#!/usr/bin/env node
// jslint wrapper for nodejs
// Adapted from rhino.js. Copyright 2002 Douglas Crockford
// Shebang removal regex uses insecure "."
// JSLINT is provided by fulljslint.js modified to export the global
/*global JSLINT */

(function (file) {
    var input_stream, 
        sys = require("sys"),
        fs = require("fs"),
        JSLINT = require("../lib/fulljslint_export").JSLINT;

    if (!file) {
        sys.puts("Usage: jslint file.js");
        process.exit(1);
    } else if (file === '-') {
        input_stream = process.openStdin();
    } else {
        input_stream = fs.createReadStream(file);
    }
    function run(input) {
        var e, i, len, success, pad;
        if (!input) {
            sys.puts("jslint: Couldn't open file '" + file + "'.");
            process.exit(1);
        } else {
            input = input.toString("utf8");
        }

        // remove shebang (lifted from node.js)
        input = input.replace(new RegExp("^\\#\\!.*", "m"), "");

        success = JSLINT(input);

        if (!success) {
            i = 0;
            len = JSLINT.errors.length;
            for (i = 0; i < len; i = i + 1) {
                pad = '' + (i + 1);
                while (pad.length < 3) {
                    pad = ' ' + pad;
                }
                e = JSLINT.errors[i];
                if (e) {
                    sys.puts(pad + ' ' + e.line + ',' + e.character + ': ' + e.reason);
                    sys.puts('    ' + (e.evidence || '').replace(/^\s+|\s+$/, ""));
                }
            }
            process.exit(2);
        }

        sys.puts("OK");
    }
    input_stream.on('data', function (chunk) {
        if (!this.data) {
            this.data = '';
        }
        this.data += chunk;
    });
    input_stream.on('end', function () {
        run(this.data);
    });    
}(process.ARGV[2]));
