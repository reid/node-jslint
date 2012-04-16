#!/usr/bin/env node

var linter = require("../lib/linter");
var reporter = require("../lib/reporter");
var nopt = require("nopt");
var fs = require("fs");

function commandOptions() {
    'use strict';
    var flags = [
            'anon', 'bitwise', 'browser', 'cap', 'continue', 'css',
            'debug', 'devel', 'eqeq', 'es5', 'evil', 'forin', 'fragment',
            'newcap', 'node', 'nomen', 'on', 'passfail', 'plusplus',
            'properties', 'regexp', 'rhino', 'undef', 'unparam',
            'sloppy', 'stupid', 'sub', 'vars', 'white', 'widget', 'windows',
            'json', 'color'
        ],
        commandOpts = {
            'indent' : Number,
            'maxerr' : Number,
            'maxlen' : Number,
            'predef' : [String, Array]
        };

    flags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}

var options = commandOptions();

var parsed = nopt(options);

function die(why) {
    'use strict';
    console.warn(why);
    console.warn("Usage: " + process.argv[1] +
        " [--" + Object.keys(options).join("] [--") +
        "] [--] <scriptfile>...");
    process.exit(1);
}

if (!parsed.argv.remain.length) {
    die("No files specified.");
}


// If there are no more files to be processed, exit with the value 1
// if any of the files contains any lint.
var maybeExit = (function () {
    'use strict';
    var filesLeft = parsed.argv.remain.length,
        ok = true;

    return function (lint) {
        filesLeft -= 1;
        ok = lint.ok && ok;

        if (filesLeft === 0) {
            // This was the last file.
            process.exit(ok ? 0 : 1);
        }
    };
}());


function lintFile(file) {
    'use strict';
    fs.readFile(file, function (err, data) {
        if (err) {
            throw err;
        }

        // Fix UTF8 with BOM
        if (0xEF === data[0] && 0xBB === data[1] && 0xBF === data[2]) {
            data = data.slice(3);
        }

        data = data.toString("utf8");
        var lint = linter.lint(data, parsed);

        if (parsed.json) {
            console.log(JSON.stringify([file, lint.errors]));
        } else {
            reporter.report(file, lint, parsed.color);
        }

        maybeExit(lint);
    });
}

parsed.argv.remain.forEach(lintFile);
