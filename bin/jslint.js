#!/usr/bin/env node
// jslint wrapper for nodejs
// Adapted from rhino.js. Copyright 2002 Douglas Crockford
// Shebang removal regex uses insecure "."
// JSLINT is provided by fulljslint.js modified to export the global
/*global JSLINT */

var sys = require("sys"),
fs = require("fs");

var fetch_input = function () {
    var input,
    stdin = process.openStdin();
    if (process.argv[2] === undefined) {
        stdin.on('data', function(chunk) {
            input += chunk;
            process_data(input)
        });
    }
    else {
        input = fs.readFileSync(process.argv[2]);
        process_data(input);
    }      
}

var process_data = function (input) {
    var e, i, len, success, pad,
    path = __filename.split("/").slice(0, -2).join("/");

    if (!input) {
        sys.print("jslint: Couldn't read input.\n");
        sys.print("Usage: jslint file.js\n");
        process.exit(1);
    } else {
        input = input.toString("utf8");
    }

    JSLINT = require("../lib/fulljslint_export").JSLINT;

    // remove shebang (lifted from node.js)
    input = input.replace(/^\#\!.*/, "");

    success = JSLINT(input, {
        predef:   [ 
            // CommonJS
            "exports", 
            // YUI
            "YUI",
            "YAHOO",
            "YAHOO_config",
            "YUI_config",
            "Y",
            // NodeJS
            "GLOBAL",
            "process",
            "require",
            "__filename",
            "module",
        ]
    });

    if (!success) {
        i = 0;
        len = JSLINT.errors.length;
        for (i=0; i<len; i++) {
            pad = '' + (i + 1);
            while (pad.length < 3) {
                pad = ' ' + pad;
            }
            e = JSLINT.errors[i];
            if (e) {
                sys.puts(pad + ' ' + e.line + ',' + e.character + ': ' + e.reason);
                sys.puts( '    ' + (e.evidence || '').replace(/^\s+|\s+$/, ""));
            }
        }
        process.exit(2);
    }

    sys.puts("OK");

}

fetch_input();