/*jslint node: true */

'use strict';

var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    jslintSource;

// LintStream uses nodelint in its constructor. Node modules are loaded
// synchronously. Therefore, the jslint source code must be available
// synchronously.
/*jslint nomen: true, stupid: true */
jslintSource = fs.readFileSync(path.join(__dirname, 'jslint.js'));
/*jslint nomen: false, stupid: false */

exports.load = function () {
    var ctx = vm.createContext();
    vm.runInContext(jslintSource, ctx);
    return ctx.JSLINT;
};
