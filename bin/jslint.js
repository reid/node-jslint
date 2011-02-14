#!/usr/bin/env node
// jslint wrapper for nodejs
// Adapted from rhino.js. Copyright 2002 Douglas Crockford
// Shebang removal regex uses insecure "."
// JSLINT is provided by fulljslint.js modified to export the global
/*global JSLINT */

(function (files) {
    var e, i, input, len, success, pad,
        path = __filename.split("/").slice(0, -2).join("/"),
        sys = require("sys"),
        fs = require("fs");

    if (files.length == 0) {
        sys.puts("Usage: jslint file.js");
        process.exit(1);
    }

    function checkFile(file) {
      input = fs.readFileSync(file);
      if (!input) {
          sys.puts("jslint: Couldn't open file '" + file + "'.");
          process.exit(1);
      } else {
          input = input.toString("utf8");
      }

      JSLINT = require("../lib/fulljslint_export").JSLINT;

      // remove shebang (lifted from node.js)
      input = input.replace(/^\#\!.*/, "");

      success = JSLINT(input, {
          predef:   [ // CommonJS
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
                      "module"       ]
      });

      if (!success) {
          sys.puts('Error in ' + file);
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
    }

    for (i in files) {
      checkFile(files[i]);
    }
    
    sys.puts("OK");

}(process.ARGV.slice(2)));
