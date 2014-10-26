'use strict';

var assert = require('assert'),
    linter = require('../lib/linter');

suite('case #101', function () {
    // https://github.com/reid/node-jslint/issues/101
    test('has warning with default options', function () {

        var options = {edition: 'latest'},
            script = "console.log('a');\n",
            result = linter.doLint(script, options);

        assert.ok(!result.ok);
    });

    test('no warning with node option', function () {

        var options = {edition: 'latest', node: true},
            script = "console.log('a');\n",
            result = linter.doLint(script, options);

        assert.ok(result.ok);
    });

});
