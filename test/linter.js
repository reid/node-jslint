var assert = require('assert'),
    nodelint = require('../lib/nodelint'),
    linter = require('../lib/linter');

suite('merge', function () {
    test('can merge when no conflict', function () {
        assert.deepEqual({a: 1, b: 2}, linter.merge({a: 1}, {b: 2}));
    });

    test('left side wins on merge', function () {
        assert.deepEqual({a: 1}, linter.merge({a: 1}, {a: 2}));
    });

    test('merge where one or more args is undefined', function () {
        assert.deepEqual({a: 1}, linter.merge({a: 1}, undefined));

        assert.deepEqual({a: 1}, linter.merge(undefined, {a: 1}));
    });

    test('merge where one object has inherited properties', function () {
        var util = require('util');

        function A() {
            this.parent = 'overridden';
        }

        function B() {
            this.own = 'overridden'
        }
        var c = { parent: 'orig', own: 'orig' };

        util.inherits(B, A);

        assert.deepEqual({ parent: 'orig', own: 'overridden' },
                         linter.merge(new B(), c));
    });
});

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

        assert.deepEqual(result.errors, []);
        assert.ok(result.ok);
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
