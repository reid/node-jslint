/*jslint node: true, forin: true, white: true, plusplus: true */

var color = require("./color");
var path = require('path');
var log = console.log;

/* utility functions */
function javaFormat(e, file) {
    "use strict";
    // returns format like:
    // jslint:file.js:10:60:missing semicolon
    if (e.error.indexOf('Too many errors') > -1) {
        return e.error;
    }
    return ("jslint:" + path.basename(file) + ':' + e.line + ':' + e.pos + ':' + e.error);
}

function simpleFormat(e) {
    "use strict";
    // like javaFormat but without the file
    return ("jslint:" + e.line + ":" + e.pos + ":" + e.error);
}

function encodeHTML(text) {
    "use strict";
    return text.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* exported API */
exports.report = function (file, lint, colorize, format) {
    'use strict';
    if (typeof(format) === 'undefined') {
        format = 'default';
    }

    var options = [], key, value, line,
        i, len, pad, e, fileMessage, errors = [], error,
        output, extension, testName;

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
                    // stripped of white space
                    code: (e.evidence || '').replace(/^\s+|\s+$/, ""),
                    evidence: e.evidence
                });
            }
        }
    }

    if (format === 'default') {
        fileMessage = "\n" + ((colorize) ? color.bold(file) : file);
        if (errors.length > 0) {
            log(fileMessage);
            for (i=0; i < errors.length; i++) {
                error = errors[i];
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
    }
    else if (format === 'xml') {
        extension = path.extname(file);
        testName = "jslint" + extension + '.' + path.basename(file, extension);
        if (errors.length > 0) {
            output = "<![CDATA[";
            for (i=0; i< errors.length; i++) {
                e = errors[i];
                output += "\n" + javaFormat(e, file);
            }
            output += "]]>";
            log("<testsuite failures='1' time='0' errors='1' tests='1' skipped='0' name='"+testName+"'>");
            log("    <testcase time='0' name='testJSLint' classname='"+testName+"'>");
            log("        <error message='" + file + " failed JSLint.'>" + output + "</error>");
            log("    </testcase>");
            log("</testsuite>");
        }
        else {
            log("<testsuite failures='0' time='0' errors='0' tests='1' skipped='0' name='"+testName+"'>");
            log("  <testcase time='0' name='testJSLint' classname='"+testName+"'></testcase>");
            log("</testsuite>");
        }
    }
    else if (format === "jslintxml") {
        log("<jslint>");
        log("<file name='"+encodeHTML(file)+"'>");
        // <issue line='4' char='10' reason='Expected exactly one space between &apos;function&apos; and &apos;(&apos;.' evidence='(function(root) {'/>
        for(i=0; i < errors.length; i++) {
            e = errors[i];
            output = "<issue line='"+e.line+"' char='"+e.pos+"' reason='";
            if (e.error.indexOf('Too many errors') > -1) {
                output += encodeHTML(e.error) + "'";
            }
            else {
                output += encodeHTML(e.error)+"' evidence='"+encodeHTML(e.evidence)+"'";
            }
            output += ' />';
            log(output);
        }
        log("</file>");
        log("</jslint>");
    }
    else if (format === "java") {
        for (i=0; i < errors.length; i++) {
            e = errors[i];
            log(javaFormat(e, file));
        }
    }
    else if (format === "simple") {
        for (i=0; i < errors.length; i++) {
            e = errors[i];
            log(simpleFormat(e, file));
        }
    }

    return lint.ok;
};
