'use strict';

var assert = require('assert'),
    linter = require('../lib/linter');

suite('case #101', function () {

    // https://github.com/reid/node-jslint/issues/101
    test('has warning with default options', function () {
        var result = linter.doLint('console.log(\'a\');\n');
        assert.ok(!result.ok);
    });

    test('no warning with node option', function () {
        var result = linter.doLint('console.log(\'a\');\n', {
            node: true
        });
        assert.ok(result.ok);
    });

});
