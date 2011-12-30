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
    }

    if (format == 'default') {
        fileMessage = "\n" + ((colorize) ? color.bold(file) : file);
        if (errors.length > 0) {
            log(fileMessage);
            for (i=0; i < errors.length; i++) {
                var error = errors[i];
                if (error.error.indexOf('Too many errors.') > -1) {
                    log(error.error);
                }
                else {
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
        else {
            log(fileMessage + " is " + ((colorize) ? color.green('OK') : 'OK') + ".");
        }
        log("\n");
    }
    else if (format == 'xml') {
        if (errors.length > 0) {
            var output = "<![CDATA[";
            for (var i=0; i< errors.length; i++) {
                e = errors[i];
                output += "\n" + javaFormat(e, file);
            }
            output += "]]>";
            log("<testsuite failures='1' time='${LINT_TIME}' errors='1' tests='1' skipped='0' name='${TEST_BASENAME}'>");
            log("    <testcase time='${LINT_TIME}' name='testJSLint' classname='${TEST_BASENAME}'>");
            log("        <error message='" + file + " failed JSLint.'>" + output + "</error>");
            log("    </testcase>");
            log("</testsuite>");
        }
        else {
            log("<testsuite failures='0' time='${LINT_TIME}' errors='0' tests='1' skipped='0' name='${TEST_BASENAME}'>");
            log("  <testcase time='${LINT_TIME}' name='testJSLint' classname='${TEST_BASENAME}'></testcase>");
            log("</testsuite>");
        }
        log("\n");
    }
    else if (format == "simple") {
        for (i=0; i < errors.length; i++) {
            e = errors[i];
            if (e.error.indexOf('Too many errors') > -1) {
                log(e.error);
            }
            else {
                log(file + ":" + e.line + ":" + e.pos + ": " + e.error);
            }
        }
        log("\n");
    }
    else if (format == "java") {
        for (i=0; i < errors.length; i++) {
            e = errors[i];
            log(javaFormat(e, file));
        }
        log("\n");
    }

    return lint.ok;
};

function javaFormat(e, file) {
    // returns format like:
    // ~/file.js:10:60 error: missing semicolon
    if (e.error.indexOf('Too many errors') > -1) {
        return e.error;
    }
    return (file + ':' + e.line + ':' + e.pos + ' error: ' + e.error);
}
