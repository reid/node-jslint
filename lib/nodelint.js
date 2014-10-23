/*jslint node: true */

var con = console,
    vm = require("vm"),
    fs = require("fs"),
    path = require('path'),
    linter = require('./linter.js'),
    LintStream = require('./lintstream.js');

exports.LintStream = LintStream;

exports.linter = linter;

exports.setConsole = function (c) {
    'use strict';
    con = c;
};

exports.load = function () {
    'use strict';

    var ctx = vm.createContext(),
        jslintSource;

    function makePathFromName(name) {
        /*jslint nomen: true */
        return path.join(__dirname, name) + ".js";
    }

    function read(name) {
        /*jslint stupid: true */
        return fs.readFileSync(name);
    }

    jslintSource = read(makePathFromName("jslint-latest"));

    vm.runInContext(jslintSource, ctx);

    return ctx.JSLINT;
};
