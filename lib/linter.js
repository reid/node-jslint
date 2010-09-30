// jslint wrapper for nodejs
// Adapted from rhino.js. Copyright 2002 Douglas Crockford
// Shebang removal regex uses insecure "."
// JSLINT is provided by fulljslint.js modified to export the global

var jslint = function () {
    var sys = require("sys"),
    JSLINT = require("../lib/fulljslint_export").JSLINT;
    that = new Object();

    that.process_data = function (input) {
        var e, i, len, success, pad,
        path = __filename.split("/").slice(0, -2).join("/"),
        output = '';

        if (!input) {
            sys.print("jslint: Couldn't read input.\n");
            process.exit(1);
        }
        else {
            input = input.toString("utf8");
        }

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
                pad = '';
                while (pad.length < 3) {
                    pad = ' ' + pad;
                }
                e = JSLINT.errors[i];
                if (e) {
                    output += pad + ' ' + e.line + ',' + e.character + ': ' + e.reason + "\n";
                }
            }
        }
        else { 
            output += "OK";
        }

        return {success: success, output: output};
    }
    
    return that;
}

exports.jslint = jslint;
