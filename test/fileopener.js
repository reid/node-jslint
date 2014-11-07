'use strict';

var assert = require('assert'),
    FileOpener  = require('../lib/fileopener.js');

suite('fileopener', function () {
    test('can create object', function () {
        assert.ok(new FileOpener());
    });

    test('can open file', function (done) {
        var f = new FileOpener();

        f.on('data', function () {
            done();
        });

        f.write('./README.md');
        f.end();
    });

    test('error on nonexistent file', function (done) {
        var f = new FileOpener();

        f.on('error', function () {
            done();
        });

        f.write('./NONEXISTENT-FILE.not-here');
        f.end();
    });
});
