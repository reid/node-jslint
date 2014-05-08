var linter = require("./linter");
var nopt = require("nopt");
var fs = require("fs");

var LintStream = require('./LintStream'),
    ReportStream = require('./ReportStream'),
    JSONReportStream = require('./JSONReportStream'),
    FileOpener = require('./FileOpener');

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

function makeReporter(parsed) {
    'use strict';
    var reporter;

    if (parsed.json) {
        reporter = new JSONReportStream(parsed);
    } else {
        reporter = new ReportStream(parsed);
    }

    reporter.on('data', function (chunk) {
        if (chunk === '.') {
            process.stderr.write(chunk);
        } else {
            con.log(chunk);
        }
    });

    return reporter;
}

exports.runMain = function (options) {
    'use strict';

    if (options.version) {
        exports.reportVersion(con.log, options);
        return;
    }

    if (!options.argv.remain.length) {
        die("No files specified.");
    }

    var remain = globFiles(options.argv.remain, glob),
        fo = new FileOpener(),
        ls = new LintStream(options),
        rep = makeReporter(options);

    fo.pipe(ls);
    ls.pipe(rep);

    rep.on('finish', function () {
        pro.exit(rep.allOK ? 0 : 1);
    });

    remain.forEach(function (file) {
        fo.write(file);
    });
    fo.end();
};
