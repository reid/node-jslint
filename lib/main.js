'use strict';

var async = require('async'),
    path = require('path'),
    nodelint = require('./nodelint'),
    optModule = require('./options'),
    nopt = require('nopt'),
    exit = require('exit'),
    glob = require('glob'),
    LintStream = require('./lintstream.js'),
    ReportStream = require('./reportstream.js'),
    JSONReportStream = require('./jsonreportstream.js'),
    FileOpener = require('./fileopener.js'),
    con = console,
    pro = process;

exports.setConsole = function (c) {
    con = c;
};

exports.setProcess = function (p) {
    pro = p;
    exit = pro.exit.bind(pro);
};

function commandOptions() {
    var commandOpts = {
        indent: Number,
        maxerr: Number,
        maxlen: Number,
        predef: Array,
        config: String
    },
        /* flags defined in jslint.js */
        jslintFlags = [
            'ass', 'bitwise', 'browser', 'closure', 'continue', 'couch',
            'debug', 'devel', 'eqeq', 'evil', 'forin', 'newcap', 'node',
            'nomen', 'passfail', 'plusplus', 'properties', 'regexp', 'rhino',
            'sloppy', 'stupid', 'sub', 'todo', 'unparam', 'vars', 'white'
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
    var options = commandOptions();
    con.warn(why);
    con.warn('Usage: ' + pro.argv[1] +
             ' [--' + Object.keys(options).sort().join('] [--') +
             '] [--] <scriptfile>...');
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

    con.log('node-jslint version: ' + version + ' (Jackson\'s fork)' + '  JSLint edition ' + edition);
    exit(0);
}

function flatten(a, b) {
    return a.concat(b);
}

function globFiles(list, callback) {
    async.map(list, function (element, callback) {
        glob(element, function (err, matches) {
            if (err) {
                throw err;
            }
            callback(null, matches);
        });
    }, function (err, result) {
        if (err) {
            throw err;
        }
        result = result.reduce(flatten, []);
        callback(result);
    });
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
            die('No files specified.');
        });
        return;
    }

    globFiles(options.argv.remain, function (files) {
        var home = process.env.HOME,
            reporter = makeReporter(options),
            optionsCache = {};

        reporter.on('finish', function () {
            exit(reporter.allOK ? 0 : 1);
        });

        // Cache all sets of options for particular directories to avoid
        // redundant IO.
        async.each(files, function (file, callback) {
            var dirname = path.dirname(file);
            if (optionsCache[dirname]) {
                callback();
                return;
            }
            optModule.getOptions(home, dirname, options, function (procOptions) {
                optionsCache[dirname] = procOptions;
                callback();
            });
        }, function () {
            // Lint in a series so results are reported in an expectable order.
            async.eachSeries(files, function (file, callback) {
                var dirname = path.dirname(file),
                    opener = new FileOpener(),
                    linter = new LintStream(optionsCache[dirname]);
                opener.pipe(linter);
                linter.pipe(reporter);
                opener.write(file, function () {
                    // Prevent EventEmitter memory leak.
                    linter.unpipe(reporter);
                    callback();
                });
            }, function () {
                reporter.end();
            });
        });
    });
};
