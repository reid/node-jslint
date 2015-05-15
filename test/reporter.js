var reporter = require('../lib/reporter'),
    assert = require('assert');

suite('reporter', function () {
    'use strict';
    var log,
        errorLint = {
            ok: false,
            errors: [
                err(1, 1, "Fake error 1."),
                err(2, 3, "Fake error 2.", "Fake evidence")
            ]
        },
        es6ErrorLint = {
            ok: false,
            errors: [ { line: 0,
                        column: 3,
                        message: "foo" } ],
            lines: [ "this is an evidence line" ]
        };




    function err(l, c, r, e) {
        var err = {
            line: l,
            character: c,
            reason: r
        };
        if(e) {
            err.evidence=e;
        }
        return err;
    };

    function newLog() {
        var o = {
            outLines: [],
            errLines: []
        };

        o.log = o.outLines.push.bind(o.outLines);
        o.err = o.errLines.push.bind(o.errLines);

        return o;
    }

    setup(function () {
        log = newLog();
        reporter.setLogger(log);
    });

    test('lint OK, no color, no terse', function () {
        reporter.report('example.js', {ok: true}, false, false);

        assert.deepEqual(1, log.outLines.length);
        assert.deepEqual("\nexample.js is OK.", log.outLines[0]);
    });

    test('lint OK, no color, terse', function () {
        reporter.report('example.js', {ok: true}, false, true);

        assert.deepEqual(1, log.errLines.length);
        assert.deepEqual(".", log.errLines[0]);
    });

    test('lint OK, color, no terse', function () {
        reporter.report('example.js', {ok: true}, true, false);

        assert.deepEqual(1, log.outLines.length);
        assert.notEqual(-1, log.outLines[0].search(/OK/));
    });

    test('lint bad, no color, no terse', function () {
        reporter.report('example.js', errorLint, false, false);

        assert.deepEqual(5, log.outLines.length);
        assert.equal(-1, log.outLines[0].search(/OK/));

        assert.deepEqual([
            '\nexample.js',
            ' #1 Fake error 1.',
            '     // Line 1, Pos 1',
            ' #2 Fake error 2.',
            '    Fake evidence // Line 2, Pos 3'
            ], log.outLines);

    });

    test('lint bad, no color, terse', function () {
        reporter.report('example.js', errorLint, false, true);

        assert.deepEqual(2, log.outLines.length);
        assert.equal(-1, log.outLines[0].search(/OK/));

        assert.deepEqual([
            'example.js:1:1: Fake error 1.',
            'example.js:2:3: Fake error 2.'
            ], log.outLines);

    });

    test('lint bad, color, no terse', function () {
        reporter.report('example.js', errorLint, true, false);

        assert.deepEqual(5, log.outLines.length);
        assert.equal(-1, log.outLines[0].search(/OK/));

        // no assertion re content: just force exercise of color branch
    });

    test('lint bad, es6 format', function () {
        reporter.report('example.js', es6ErrorLint, true, false);
    });

});
