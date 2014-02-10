var linter = require("./linter");
var reporter = require("./reporter");
var nopt = require("nopt");
var fs = require("fs");
var con = console;
var pro = process;

/*jslint nomen: true*/
var currentDir = __dirname;
/*jslint nomen: false */

exports.setConsole = function (c) {
    'use strict';
    con = c;
};

exports.setProcess = function (p) {
    'use strict';
    pro = p;
};

function commandOptions() {
    'use strict';

    /* flags defined in jslint-latest.js */
    var jslintFlags = [
        'ass', 'bitwise', 'browser', 'closure', 'continue',
        'debug', 'devel', 'eqeq', 'evil', 'forin', 'newcap',
        'node', 'nomen', 'passfail', 'plusplus', 'properties',
        'regexp', 'rhino', 'unparam', 'sloppy', 'stupid', 'sub',
        'todo', 'vars', 'white'
    ],
        /* flags used by node-jslint to control output */
        cliFlags = [
            'json', 'color', 'terse', 'version'
        ],
        /* not used by jslint-latest.js */
        deprecatedFlags = [
            'anon', 'es5', 'on', 'undef', 'windows'
        ],
        flags = jslintFlags.concat(cliFlags).concat(deprecatedFlags),
        commandOpts = {
            'indent' : Number,
            'maxerr' : Number,
            'maxlen' : Number,
            'predef' : [String, Array],
            'edition' : String
        };

    flags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}
exports.commandOptions = commandOptions;

function die(why) {
    'use strict';
    var o = commandOptions();
    con.warn(why);
    con.warn("Usage: " + pro.argv[1] +
        " [--" + Object.keys(o).sort().join("] [--") +
        "] [--] <scriptfile>...");
    pro.exit(1);
}

function parseArgs(argv) {
    'use strict';
    return nopt(commandOptions(), {}, argv);
}
exports.parseArgs = parseArgs;

exports.reportVersion = function reportVersion(callback, options) {
    'use strict';
    var path = require("path"),
        packageFile = path.join(currentDir, "../package.json");

    fs.readFile(packageFile, function (err, data) {
        if (err) {
            die(err);
        }

        var package_data = JSON.parse(data),
            version = package_data.version,
            edition = linter.loadJSLint(options).edition;

        callback("node-jslint version: " + version + "  JSLint edition " + edition);
    });

};

exports.main = function () {
    'use strict';
    exports.runMain(parseArgs());
};

exports.runMain = function (parsed) {
    'use strict';

    var maybeExit;

    if (parsed.version) {
        exports.reportVersion(con.log, parsed);
        return;
    }

    if (!parsed.argv.remain.length) {
        die("No files specified.");
    }

    function lintFile(file) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }

            var lint = linter.lint(data, parsed);

            if (parsed.json) {
                con.log(JSON.stringify([file, lint.errors]));
            } else {
                reporter.report(file, lint, parsed.color, parsed.terse);
            }

            maybeExit(lint);
        });
    }

    // If there are no more files to be processed, exit with the value 1
    // if any of the files contains any lint.
    maybeExit = (function () {
        var filesLeft = parsed.argv.remain.length,
            ok = true;

        function exitWithCode() {
            pro.exit(ok ? 0 : 1);
        }

        return function (lint) {
            filesLeft -= 1;
            ok = lint.ok && ok;

            if (filesLeft === 0) {

                // This was the last file.
                if (pro.stdout.isTTY) {
                    exitWithCode();
                } else {
                    pro.stdout.on('drain', exitWithCode);
                }
            }
        };
    }());

    parsed.argv.remain.forEach(lintFile);
};
