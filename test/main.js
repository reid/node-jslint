'use strict';

var assert = require('assert'),
    fs = require('fs.extra'),
    main = require('../lib/main');

function mockConsole() {
    var c = {
        warnings: [],
        warn: function (str) {
            c.warnings.push(str);
        },
        loggings: [],
        log: function (str) {
            c.loggings.push(str);
        }
    };

    return c;
}

function mockProcess() {
    var p = {
        argv: ['jslint'],
        exit: function (c) {
            this.exitCode = c;
            this.events.exit.forEach(function (f) {
                f();
            });
        },
        doDrain: function () {
            this.events.drain.forEach(function (f) {
                f();
            });
        },
        events: {
            exit: [],
            drain: []
        },
        on: function (event, f) {
            this.events[event].push(f);
        },
        stdout: {
            isTTY: true,
            on: function (event, fn) {
                /*jslint unparam: true */
                process.nextTick(function () {
                    fn();
                    p.doDrain();
                });
            },
            callbacks: {
                drain: []
            }
        },
        stderrWritings: [],
        stderr: {
            isTTY: true,
            write: function (string) {
                p.stderrWritings.push(string);
            }
        }
    };
    return p;
}

function mockParsed() {
    return {
        argv: {
            remain: []
        }
    };
}

suite('main', function () {
    var pro, con;

    setup(function () {
        con = mockConsole();
        pro = mockProcess();

        main.setConsole(con);
        main.setProcess(pro);
    });

    test('no args', function (done) {
        var parsed = mockParsed();

        main.runMain(parsed);

        pro.on('exit', function () {
            assert.strictEqual(1, pro.exitCode);
            assert.strictEqual(2, con.warnings.length);
            done();
        });
    });

    test('bad edition', function (done) {
        var parsed = mockParsed();

        parsed.argv.remain.push('test/fixtures/bad.js');
        parsed.edition = 'abc123';

        main.runMain(parsed);

        pro.on('exit', function () {
            assert.strictEqual(1, pro.exitCode);
            assert.strictEqual(2, con.warnings.length);
            assert.ok(/^"abc123" is not a valid JSLint edition\./.test(con.warnings[0]));
            done();
        });
    });

    test('bad lint', function (done) {
        var parsed = mockParsed();

        parsed.argv.remain.push('test/fixtures/bad.js');

        main.runMain(parsed);

        pro.on('exit', function () {
            assert.strictEqual(1, pro.exitCode);
            done();
        });
    });

    test('glob files', function (done) {
        var parsed = mockParsed();

        parsed.argv.remain.push('lib/mai*.js');

        pro.on('exit', done);

        parsed.terse = true;

        main.runMain(parsed);

        assert.ok(main);
    });

    test('one file, not tty, json output', function (done) {
        var parsed = mockParsed();

        parsed.argv.remain.push('lib/reporter.js');

        parsed.json = true;

        pro.stdout.isTTY = false;

        pro.on('exit', function () {
            assert.strictEqual(0, pro.exitCode);
            done();
        });

        main.runMain(parsed);

        assert.ok(main);

        // expect process.exit(0) to be as yet uncalled
        assert.strictEqual(undefined, pro.exitCode);
    });

    suite('files', function () {

        var oldDir = process.cwd();

        setup(function (done) {
            fs.mkdirp('test_config/1', function (err) {
                if (err) {
                    return done(err);
                }
                process.chdir('test_config');
                done();
            });
        });

        setup(function (done) {
            fs.writeFile('.jslintrc', JSON.stringify({}), done);
        });

        setup(function (done) {
            fs.writeFile('1/.jslintrc', JSON.stringify({}), done);
        });

        setup(function (done) {
            fs.writeFile('1.js', '', function () {
                fs.writeFile('1/2.js', '', function () {
                    fs.writeFile('1/3.js', '', function () {
                        done();
                    });
                });
            });
        });

        suiteTeardown(function (done) {
            process.chdir(oldDir);
            fs.rmrf('test_config', function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        test('reuse cached .jslintrc files without errors', function (done) {

            var parsed = mockParsed();
            parsed.argv.remain = parsed.argv.remain.concat([
                '1.js',
                '1/2.js',
                '1/3.js'
            ]);

            main.runMain(parsed);

            pro.on('exit', function () {
                assert.strictEqual(0, pro.exitCode);
                done();
            });

        });

    });

    test('todo in command-line options', function () {
        var o = main.commandOptions();

        assert.strictEqual(Boolean, o.todo);
    });

    test('returns a version', function (done) {

        main.runMain({
            version: true
        });

        pro.on('exit', function () {
            assert.ok(/^node-jslint version:/.test(con.loggings[0]));
            assert.ok(/ {2}JSLint edition/.test(con.loggings[0]));
            done();
        });

    });

    test('argument parsing: config is a string', function () {
        var options = main.parseArgs(['node', 'jslint', '--config=jslint.conf']);

        assert.equal('jslint.conf', options.config);
    });

    test('most data goes to console.log', function (done) {
        var rep = main.makeReporter({});
        rep.on('finish', function () {
            assert.equal(con.loggings.length, 1);
            assert.equal(con.loggings[0], 'log message');
            done();
        });
        rep.emit('data', 'log message');
        rep.end();
    });

    test('dots go to process.stderr', function (done) {
        var rep = main.makeReporter({});
        rep.on('finish', function () {
            assert.equal(pro.stderrWritings.length, 1);
            assert.equal(pro.stderrWritings[0], '.');
            done();
        });
        rep.emit('data', '.');
        rep.end();
    });

});
