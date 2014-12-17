var assert = require('assert'),
    stream = require('../lib/stream'),
    ReportStream = require('../lib/reportstream.js'),
    JSONReportStream = require('../lib/jsonreportstream.js'),
    CollectorStream = require('../lib/collectorstream.js');

suite('reportstream', function () {
    test('can create object', function () {
        var r = new ReportStream();

        assert.ok(r instanceof ReportStream);
        assert.ok(r instanceof stream.Transform);
    });

    test('can create object incorrectly', function () {
        var r = ReportStream();

        assert.ok(r instanceof ReportStream);
        assert.ok(r instanceof stream.Transform);
    });

    test('can async', function (done) {
        var r = new ReportStream();

        r.on('data', function(chunk) {
            assert.deepEqual(chunk, '\nexample.js is OK.');
            done();
        });

        r.write({file: 'example.js', linted: {ok: true}});
        r.end();
    });

    test('can make a colorized reporter', function (done) {
        var r = new ReportStream({color: true});

        r.on('data', function(chunk) {
            assert.deepEqual(chunk, '\n\x1b[1mexample.js\x1b[0m is \x1b[32mOK\x1b[0m.');
            done();
        });

        r.write({file: 'example.js', linted: {ok: true}});
        r.end();
    });

    test('can make a terse reporter', function (done) {
        var r = new ReportStream({terse: true});

        r.on('data', function(chunk) {
            assert.deepEqual(chunk, '.');
            done();
        });

        r.write({file: 'example.js', linted: {ok: true}});
        r.end();
    });

    test('can make two reporters with diff. behavior', function (done) {
        var r1 = new ReportStream(),
            r2 = new ReportStream({terse: true});

        r1.on('data', function (chunk) {
            r2.write({file: 'example.js', linted: {ok: true}});
            r2.end();
        });
        r2.on('data', function (chunk) {
            assert.equal(chunk, '.');
            done();
        });

        r1.write({file: 'example.js', linted: {ok: true}});
        r1.end();
    });

    test('how about a JSONReportStream', function (done) {
        var r = new JSONReportStream();

        r.on('data', function (chunk) {
            assert.deepEqual(chunk, JSON.stringify(['example.js', null]));
            done();
        });

        r.write({file: 'example.js', linted: {ok: true}});
        r.end();
    });

    test('incorrectly construct a JSONReportStream', function (done) {
        var r = JSONReportStream();

        assert.ok(r instanceof JSONReportStream);
        assert.ok(r instanceof stream.Transform);
        done();
    });
});

suite('collectorstream', function () {
    test('can create object', function () {
        var r = new CollectorStream();

        assert.ok(r instanceof CollectorStream);
        assert.ok(r instanceof stream.Transform);
    });

    test('can create object incorrectly', function () {
        var r = CollectorStream();

        assert.ok(r instanceof CollectorStream);
        assert.ok(r instanceof stream.Transform);
    });
});
