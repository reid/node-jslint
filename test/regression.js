var assert = require('assert'),
    nodelint = require('../lib/nodelint'),
    linter = require('../lib/linter');

suite('case #101', function () {
    // https://github.com/reid/node-jslint/issues/101
    test('has warning with default options', function () {

        var options = {edition: 'latest'},
            JSLINT = nodelint.load(options.edition),
            script = "console.log('a');\n",
            result = linter.doLint(JSLINT, script, options);

        assert.ok(!result.ok);
    });

    test('no warning with node option', function () {

        var options = {edition: 'latest', node: true},
            JSLINT = nodelint.load(options.edition),
            script = "console.log('a');\n",
            result = linter.doLint(JSLINT, script, options);

        assert.ok(result.ok);
    });

    test('use es6 linter', function () {

        var options = {edition: 'es6', node: true},
            JSLINT = nodelint.load(options.edition),
            script = "console.log('a');\n",
            result = linter.doLint(JSLINT, script, options);

        assert.ok(result);
    });

});
