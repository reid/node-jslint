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

    suite('old edition', function () {

        test('querystring global', function () {
            var script = 'querystring.parse(\'\');',
                currentResult = linter.doLint(script, {
                    node: true,
                    edition: '2014-07-08'
                }),
                oldEditionResult = linter.doLint(script, {
                    node: true,
                    edition: '2014-02-06'
                });

            // querystring is no longer a global in Node.
            assert.strictEqual(currentResult.ok, false);

            // But back in early 2014 it was still considered one.
            assert.strictEqual(oldEditionResult.ok, true);
        });

        test('anon', function () {
            var script = [
                '(function() {',
                '    \'use strict\';',
                '}());'
            ].join('\n'),
                currentResult = linter.doLint(script, {
                    anon: true,
                    edition: '2014-07-08'
                }),
                oldEditionResult = linter.doLint(script, {
                    anon: true,
                    edition: '2013-02-03'
                });

            // anon is no longer an option.
            assert.strictEqual(currentResult.ok, false);

            // But back in early 2013 you could disable spaces after anonymous
            // functions. How hideous!
            assert.strictEqual(oldEditionResult.ok, true);
        });

        test('widget', function () {
            var script = 'widget.toString();',
                currentResult = linter.doLint(script, {
                    widget: true,
                    edition: '2014-07-08'
                }),
                oldEditionResult = linter.doLint(script, {
                    widget: true,
                    edition: '2012-02-03'
                });

            // widget is no longer an option.
            assert.strictEqual(currentResult.ok, false);

            // But back in early 2012 you could populate your global namespace
            // with Yahoo's widget library. Convenient if you were a Yahoo
            // employee at that time.
            assert.strictEqual(oldEditionResult.ok, true);
        });

        test('windows', function () {
            var script = 'new ActiveXObject().Application.Quit();',
                currentResult = linter.doLint(script, {
                    windows: true,
                    edition: '2014-07-08'
                }),
                oldEditionResult = linter.doLint(script, {
                    windows: true,
                    edition: '2013-02-03'
                });

            // windows is no longer an option.
            assert.strictEqual(currentResult.ok, false);

            // But it used to be.
            assert.strictEqual(oldEditionResult.ok, true);
        });

        test('todo', function () {
            var script = '// TODO: Write better code.',
                currentResult = linter.doLint(script, {
                    edition: '2014-07-08'
                }),
                oldEditionResult = linter.doLint(script, {
                    edition: '2012-02-03'
                });

            // TODOs are actually technical debt.
            assert.strictEqual(currentResult.ok, false);

            // But back in the good ol' days we didn't care about that.
            assert.strictEqual(oldEditionResult.ok, true);
        });

    });

});
