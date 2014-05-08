/*jslint
 nomen: true, stupid: true
*/
var con = console,
    vm = require("vm"),
    fs = require("fs"),
    LintStream = require('./lintstream.js');

exports.LintStream = LintStream;

exports.setConsole = function (c) {
    'use strict';
    con = c;
};

exports.load = function (edition) {
    'use strict';

    var ctx = vm.createContext(),
        f;

    function read(name) {
        return fs.readFileSync(__dirname + "/" + name + ".js");
    }

    if (edition) {
        try {
            f = read("jslint-" + edition);
        } catch (err) {
            con.warn("Unable to load edition " + edition + ", reverting to default. " + err);
        }
    }

    if (!f) {
        f = read("jslint");
    }

    vm.runInContext(f, ctx);

    return ctx.JSLINT;
};
