var assert = require("assert");
var nodelint = require("../lib/nodelint");
var linter = require("../lib/linter");

suite("case #101", function () {
    // https://github.com/reid/node-jslint/issues/101
    test("has warning with default options", function () {

        var options = {edition: "latest"};
        var JSLINT = nodelint.load(options.edition);
        var script = "console.log('a');\n";
        var result = linter.doLint(JSLINT, script, options);

        assert.ok(!result.ok);
    });

    test("no warning with node option", function () {

        var options = {edition: "latest", node: true};
        var JSLINT = nodelint.load(options.edition);
        var script = "console.log('a');\n";
        var result = linter.doLint(JSLINT, script, options);

        assert.ok(result.ok);
    });

    test("use es6 linter", function () {

        var options = {edition: "es6", node: true};
        var JSLINT = nodelint.load(options.edition);
        var script = "console.log('a');\n";
        var result = linter.doLint(JSLINT, script, options);

        assert.ok(result);
    });

    test("post-es6 versions report edition", function (done) {
         var options = {edition: "2015-05-08"};
         var main = require("../lib/main");

         main.reportVersion(function (version) {
            assert.ok(/^node-jslint version:/.test(version));
            assert.ok(/  JSLint edition 2015-05-08/.test(version));
            done();
         }, options );
    });
});
