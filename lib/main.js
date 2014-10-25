/*jslint node: true */

'use strict';

var nodelint = require('./nodelint');
var optModule = require('./options');
var nopt = require("nopt");
var fs = require("fs"),
    exit = require('exit'),
    glob = require('glob');

var LintStream = require('./lintstream.js'),
    ReportStream = require('./reportstream.js'),
    JSONReportStream = require('./jsonreportstream.js'),
    FileOpener = require('./fileopener.js');

var con = console;
var pro = process;

/*jslint nomen: true*/
var currentDir = __dirname;
/*jslint nomen: false */

exports.setConsole = function (c) {
    con = c;
};

exports.setProcess = function (p) {
    pro = p;
    exit = pro.exit.bind(pro);
};

function commandOptions() {
    var commandOpts = {
            'indent' : Number,
            'maxerr' : Number,
            'maxlen' : Number,
            'predef' : [String, Array],
            'edition' : String,
            'config' : String
        },
        /* flags defined in jslint-latest.js */
        jslintFlags = [
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
        allFlags = jslintFlags.concat(cliFlags);

    allFlags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}
exports.commandOptions = commandOptions;

function die(why) {
    var o = commandOptions();
    con.warn(why);
    con.warn("Usage: " + pro.argv[1] +
             " [--" + Object.keys(o).sort().join("] [--") +
             "] [--] <scriptfile>...");
    exit(1);
}

function parseArgs(argv) {
    return nopt(commandOptions(), {}, argv);
}
exports.parseArgs = parseArgs;

function reportVersion() {
    var packageData = require('../package.json'),
        version = packageData.version,
        edition = nodelint.load().edition;

    con.log("node-jslint version: " + version + "  JSLint edition " + edition);
    exit(0);
}

function expandGlob(glob) {
    return function (pattern) {
        return glob.sync(pattern);
    };
}

function noNodeModules(file) {
    return file.indexOf('node_modules') === -1;
}

function flatten(a, b) {
    return a.concat(b);
}

function globFiles(list, glob) {
    var remain = [];

    remain = list.map(expandGlob(glob))
        .reduce(flatten, [])
        .filter(noNodeModules);

    return remain;
}

function makeReporter(parsed) {
    var reporter;

    if (parsed.json) {
        reporter = new JSONReportStream(parsed);
    } else {
        reporter = new ReportStream(parsed);
    }

    reporter.on('data', function (chunk) {
        if (chunk === '.') {
            pro.stderr.write(chunk);
        } else {
            con.log(chunk);
        }
    });

    return reporter;
}
exports.makeReporter = makeReporter;

exports.runMain = function (options) {
    if (options.version) {
        process.nextTick(reportVersion);
        return;
    }

    if (!options.argv.remain.length) {
        process.nextTick(function () {
            die("No files specified.");
        });
        return;
    }

    optModule.getOptions(process.env.HOME, options, function (procOptions) {

        var files = globFiles(options.argv.remain, glob),
            opener = new FileOpener(),
            linter = new LintStream(procOptions),
            reporter = makeReporter(procOptions);

        opener.pipe(linter);
        linter.pipe(reporter);

        reporter.on('finish', function () {
            exit(reporter.allOK ? 0 : 1);
        });

        files.forEach(function (file) {
            opener.write(file);
        });
        opener.end();

    });
};
