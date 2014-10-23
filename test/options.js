/*jslint node: true */
/*global suite, suiteSetup, suiteTeardown, setup, teardown, test */

'use strict';

var assert = require('assert'),
    async = require('async'),
    options = require('../lib/options');

suite('splitPredefs', function () {
    test('can split predefs', function () {
        assert.deepEqual({predef: ['foo', 'bar', 'baz']},
                         options.splitPredefs({predef: "foo,bar,baz"}));
    });
    test('doesnt re-split predefs', function () {
        assert.deepEqual({predef: ['foo', 'bar', 'baz']},
                         options.splitPredefs({predef: ['foo', 'bar', 'baz']}));
    });
});

suite('preprocessOptions', function () {
    test('accepts falsy options', function () {
        assert.deepEqual(options.preprocessOptions(undefined), options.preprocessOptions({}));
    });
});

suite('current dir config file', function () {
    var oldDir = process.cwd(),
        fs = require('fs.extra'),
        con;

    function mockConsole() {
        return {
            warnings: [],
            warn: function (str) {
                this.warnings.push(str);
            }
        };
    }

    suiteSetup(function (done) {
        // mock console object
        con = mockConsole();
        options.setConsole(con);

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

    suite('no crash when malformed jslintrc', function () {

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
