/*jslint node: true */

var con = console,
    vm = require("vm"),
    fs = require("fs"),
    path = require('path'),
    linter = require('./linter.js'),
    LintStream = require('./lintstream.js'),
    jslintSource;

// LintStream uses nodelint in its constructor. Node modules are loaded
// synchronously. Therefore, the jslint source code must be available
// synchronously.
/*jslint nomen: true, stupid: true */
jslintSource = fs.readFileSync(path.join(__dirname, 'jslint.js'));
/*jslint nomen: false, stupid: false */

exports.LintStream = LintStream;

exports.linter = linter;

exports.setConsole = function (c) {
    'use strict';
    con = c;
};

exports.load = function () {
    'use strict';
    var ctx = vm.createContext();
    vm.runInContext(jslintSource, ctx);
    return ctx.JSLINT;
};
