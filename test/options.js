/*jslint node: true */
/*global suite, suiteSetup, suiteTeardown, setup, teardown, test */

'use strict';

var assert = require('assert'),
    async = require('async'),
    fs = require('fs.extra'),
    options = require('../lib/options');

function mockConsole() {
    return {
        warnings: [],
        warn: function (str) {
            this.warnings.push(str);
        }
    };
}

suite('options', function () {

    var oldDir = process.cwd();

    suiteSetup(function (done) {
        fs.mkdirp('test_config/1/2/3', function (err) {
            if (err) {
                return done(err);
            }
            process.chdir('test_config');
            done();
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

    suite('splitPredefs', function () {

        var expected = {predef: ['foo', 'bar', 'baz']};

        test('can split predefs', function (done) {
            fs.writeFile('.jslintrc', '{"predef": "foo,bar,baz"}', function () {
                options.getOptions('.', {}, function (conf) {
                    assert.deepEqual(expected, conf);
                    done();
                });
            });
        });

        test('doesnt re-split predefs', function (done) {
            fs.writeFile('.jslintrc', '{"predef": ["foo", "bar", "baz"]}', function () {
                options.getOptions('.', {}, function (conf) {
                    assert.deepEqual(expected, conf);
                    done();
                });
            });
        });

    });

    suite('access', function () {

        var con;

        suiteSetup(function (done) {
            con = mockConsole();
            options.setConsole(con);
            fs.open('.jslintrc', 'w', function () {
                fs.chmod('.jslintrc', 0, done);
            });
        });

        suiteTeardown(function (done) {
            options.setConsole(console);
            fs.unlink('.jslintrc', done);
        });

        test('unreable file produces output', function (done) {
            options.getOptions('.', {}, function () {
                assert(con.warnings[0].indexOf('Error reading config file') > -1);
                done();
            });
        });

    });

    suite('current dir config file', function () {

        suite('no crash when malformed jslintrc', function () {

            var con;

            suiteSetup(function () {
                con = mockConsole();
                options.setConsole(con);
            });

            suiteTeardown(function () {
                options.setConsole(console);
            });

            test('empty file', function (done) {
                fs.writeFile('.jslintrc', "", function () {
                    options.getOptions('.', {}, function () {
                        assert(con.warnings[0].indexOf('Error reading config file') > -1);
                        done();
                    });
                });
            });

            test('invalid json', function (done) {
                fs.writeFile('.jslintrc', "{ 'invalid json': true", function () {
                    options.getOptions('.', {}, function () {
                        assert(con.warnings[0].indexOf('Error reading config file') > -1);
                        done();
                    });
                });
            });

        });

        suite('merge global and local config correctly', function () {

            var home;

            suiteSetup(function (done) {
                fs.writeFile('.jslintrc', '{"foo": 1}', done);
            });

            suiteSetup(function (done) {
                fs.writeFile('1/2/.jslintrc', '{"foo": 2}', done);
            });

            suiteSetup(function (done) {
                fs.writeFile('1/2/3/.jslintrc', '{"bar": 3}', done);
            });

            setup(function () {
                home = process.cwd();
            });

            teardown(function () {
                process.chdir(home);
            });

            test('no local = use home', function (done) {
                process.chdir('1');
                options.getOptions(home, {}, function (conf) {
                    assert.deepEqual({foo: 1}, conf);
                    done();
                });
            });

            test('local overrides home', function (done) {
                process.chdir('1/2');
                options.getOptions(home, {}, function (conf) {
                    assert.deepEqual({foo: 2}, conf);
                    done();
                });
            });

            test('configs cascade from lower directories', function (done) {
                process.chdir('1/2/3');
                options.getOptions(home, {}, function (conf) {
                    assert.deepEqual({foo: 2, bar: 3}, conf);
                    done();
                });
            });

        });

        suite('load specific-named config files', function () {

            suiteSetup(function (done) {
                fs.writeFile('.jslintrc', '{"foo": "local"}', done);
            });

            test('pretend current directory is home', function (done) {
                options.getOptions('.', {}, function (conf) {
                    assert.deepEqual({foo: "local"}, conf);
                    done();
                });
            });

            test('Windows: process.env.HOME can be unset (undefined)', function (done) {
                options.getOptions(undefined, {}, function (conf) {
                    assert.deepEqual({foo: "local"}, conf);
                    done();
                });
            });

        });

        suite('load user-named config files', function () {

            suiteSetup(function (done) {
                fs.writeFile('user.jslint.conf', '{"bar": "user"}', done);
            });

            test('pretend current directory is home', function (done) {
                options.getOptions('.', {
                    config: './user.jslint.conf'
                }, function (conf) {
                    assert.equal("user", conf.bar);
                    done();
                });
            });

        });
    });

});
