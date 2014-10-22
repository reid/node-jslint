// this file is test/lintstream.js
// tests for stream interface to JSLint
//
// Copyright 2014 Cubane Canada Inc.
//
// Released under modified MIT/BSD 3-clause license
// See LICENSE for details.

var assert = require('assert'),
    stream = require('../lib/stream'),
    LintStream = require('../lib/lintstream.js');

suite('lintstream', function () {
    test('can create object', function () {
        var l = new LintStream();

        assert.ok(l instanceof LintStream);
        assert.ok(l instanceof stream.Transform);
    });

    test('can create object incorrectly', function () {
        var l = LintStream();

        assert.ok(l instanceof LintStream);
        assert.ok(l instanceof stream.Transform);
    });

    test('can lint a file', function (done) {
        var l = new LintStream();

        l.on('data', function (chunk) {
            assert.equal(chunk.file, 'example.js');

            assert.ok(chunk.linted.ok);
            assert.deepEqual(chunk.linted.errors, []);
            assert.deepEqual(chunk.linted.options, {});

            done();
        });

        l.write({file: 'example.js', body: ''});
    });
});
