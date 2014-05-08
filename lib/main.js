var linter = require("./linter");
var reporter = require("./reporter");
var nopt = require("nopt");
var fs = require("fs");
var glob;
var con = console;
var pro = process;

/*jslint nomen: true*/
var currentDir = __dirname;
/*jslint nomen: false */

try {
    glob = require("glob");
    exports.glob = glob;
} catch (ignore) {}

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
            'edition' : String,
            'config' : String
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
    process.nextTick(function () {
        var package_data = require('../package.json'),
            version = package_data.version,
            edition = linter.loadJSLint(options).edition;

        callback("node-jslint version: " + version + "  JSLint edition " + edition);
    });

};

function identity(pattern) {
    'use strict';
    return pattern;
}

function expandGlob(glob) {
    'use strict';
    if (!glob) {
        return identity;
    }

    return function (pattern) {
        return glob.sync(pattern);
    };
}
exports.expandGlob = expandGlob;

function noNodeModules(file) {
    'use strict';
    return file.indexOf('node_modules') === -1;
}
exports.noNodeModules = noNodeModules;

function flatten(a, b) {
    'use strict';

    return a.concat(b);
}

function globFiles(list, glob) {
    'use strict';
    var remain = [];

    remain = list.map(expandGlob(glob)).reduce(flatten, []).filter(noNodeModules);

    return remain;
}
exports.globFiles = globFiles;

function consoleReport(file, lint) {
    'use strict';
    con.log(JSON.stringify([file, lint.errors]));
}

function makeLintFile(parsed, maybeExit, reporter) {
    'use strict';
    return function lintFile(file) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                con.log(err);
                return;
            }

            var lint = linter.lint(data, parsed);

            reporter(file, lint, parsed.color, parsed.terse);

            maybeExit(lint);
        });
    };
}

function makeReporter(parsed) {
    'use strict';
    if (parsed.json) {
        return consoleReport;
    }

    return reporter.report.bind(reporter);
}

exports.runMain = function (parsed) {
    'use strict';

    var maybeExit,
        lintFile,
        remain = [];

    if (parsed.version) {
        exports.reportVersion(con.log, parsed);
        return;
    }

    if (!parsed.argv.remain.length) {
        die("No files specified.");
    }


    remain = globFiles(parsed.argv.remain, glob);

    // If there are no more files to be processed, exit with the value 1
    // if any of the files contains any lint.
    maybeExit = (function () {
        var filesLeft = remain.length,
            ok = true;

        function exitWithCode() {
            var code = ok ? 0 : 1;
            pro.exit(code);
        }

        return function (lint) {
            filesLeft -= 1;
            ok = lint.ok && ok;

            if (filesLeft === 0) {
                exitWithCode();
            }
        };
    }());

    lintFile = makeLintFile(parsed, maybeExit, makeReporter(parsed));

    remain.forEach(lintFile);
};
