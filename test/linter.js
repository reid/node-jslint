'use strict';

var assert = require('assert'),
    nodelint = require('../lib/nodelint'),
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
    teardown(function () {
        process.env.HOME = oldHome;
    });

    test('basic lint step', function () {

        var script = "// only a comment\n",
            options = {edition: 'latest'},
            JSLINT = nodelint.load(options.edition),
            result;

        // don't let user's config interfere with our test
        process.env.HOME = '';

        result = linter.doLint(JSLINT, script, options);

        assert.ok(result.ok);
        assert.deepEqual(result.errors, []);
    });

    test('lint finds error', function () {

        var script = "//TODO: remove this\n",
            options = {edition: '2013-09-22'},
            JSLINT = nodelint.load(options.edition),
            result;

        // don't let user's config interfere with our test
        process.env.HOME = '';

        result = linter.doLint(JSLINT, script, options);

        assert.strictEqual(1, result.errors.length);
        assert.strictEqual("Unexpected TODO comment.",
                           result.errors[0].raw);

    });

    test('maxerr causes null error', function () {
        var JSLINT = nodelint.load('lib/jslint-2013-09-22.js'),
            script = "var __evil = eval('3')",
            options = {maxerr: 1},
            result;

        result = linter.doLint(JSLINT, script, options);

        assert.equal(result.ok, false);
        assert.equal(result.errors.length, 3);
        assert.equal(result.errors[2], null);

    });


});
