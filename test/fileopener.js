var assert = require('assert'),
    stream = require('stream'),
    FileOpener  = require('../lib/fileopener.js');

suite('fileopener', function () {
    test('can create object', function () {
        var f = new FileOpener();
    });

    test('can open file', function (done) {
        var f = new FileOpener();

        f.on('data', function(chunk) {
            done();
        });

        f.write('./README.md');
        f.end();
    });

    test('error on nonexistent file', function (done) {
        var f = new FileOpener();

        f.on('error', function(chunk) {
            done();
        });

        f.write('./NONEXISTENT-FILE.not-here');
        f.end();
    });
});
