#!/usr/bin/env node

var linter = require("../lib/linter");
var reporter = require("../lib/reporter");
var nopt = require("nopt");
var fs = require("fs");

function commandOptions () {
    var flags = [
        'adsafe', 'bitwise', 'browser', 'cap', 'continue', 'css',
        'debug', 'devel', 'es5', 'evil', 'forin', 'fragment',
        'newcap', 'node', 'nomen', 'on', 'onevar', 'passfail',
        'plusplus', 'regexp', 'rhino', 'undef', 'safe', 'windows',
        'strict', 'sub', 'white', 'widget', 'goodparts', 'json'
    ];

    var commandOpts = {
        'indent' : Number,
        'maxerr' : Number,
        'maxlen' : Number,
        'predef' : [String, null]
    };

    flags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}

var options = commandOptions(),
    shorthandOptions = {
        "good" : ["--goodparts"],
        "gp" : ["--goodparts"]
    },
    shorthands = Object.keys(shorthandOptions);

var parsed = nopt(options, shorthandOptions);

function die(why) {
    console.warn(why);
    console.warn("Usage: " + process.argv[1] +
        " [--" + Object.keys(options).join("] [--") +
        "] [-" + shorthands.join("] [-") +
        "] <scriptfile>...");
    process.exit(1);
}

if (!parsed.argv.remain.length) {
    die("No files specified.");
}


// If there are no more files to be processed, exit with the value 1
// if any of the files contains any lint.
var maybeExit = (function() {
    var filesLeft = parsed.argv.remain.length;
    var ok = true;

    return function (lint) {
	filesLeft -= 1;
	ok = lint.ok && ok;
	
	if (filesLeft === 0) {
	    // This was the last file; return appropriate exit value.
	    process.exit(ok ? 0 : 1);
	}
    };
}());
	

function lintFile(file) {
    fs.readFile(file, function (err, data) {
        if (err) {
            throw err;
        }
        data = data.toString("utf8");
        var lint = linter.lint(data, parsed);

        if (parsed.json) {
            console.log(JSON.stringify([file, lint]));
        } else {
            reporter.report(file, lint);
        }
	maybeExit(lint);
    });
}

parsed.argv.remain.forEach(lintFile);
