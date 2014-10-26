'use strict';

var assert = require('assert'),
    linter = require('../lib/linter');

suite('preprocessScript', function () {

    test('removes leading BOM', function () {
        assert.equal('var x=1;', linter.preprocessScript('var x=1;'));
        assert.equal('var x=1;', linter.preprocessScript('\uFEFFvar x=1;'));
    });

    test('removes shebang', function () {
        assert.equal('\nvar x=1;', linter.preprocessScript('#!/usr/bin/env node\nvar x=1;'));
    });

});

suite('lint', function () {
    var oldHome = process.env.HOME;

    setup(function () {
        // Don't let user's config interfere with the test.
        process.env.HOME = '';
    });

    teardown(function () {
        process.env.HOME = oldHome;
    });

    test('basic lint step', function () {
        var result = linter.doLint('// only a comment\n');
        assert.ok(result.ok);
        assert.deepEqual(result.errors, []);
    });

    test('lint finds error', function () {
        var result = linter.doLint('//TODO: remove this\n');
        assert.strictEqual(1, result.errors.length);
        assert.strictEqual('Unexpected TODO comment.', result.errors[0].raw);

    });

    test('maxerr causes null error', function () {
        var result = linter.doLint('var __evil = eval(\'3\')', {
            maxerr: 1
        });
        assert.equal(result.ok, false);
        assert.equal(result.errors.length, 3);
        assert.equal(result.errors[2], null);
    });

});
