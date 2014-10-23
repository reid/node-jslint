/*jslint node: true */
/*global suite, suiteSetup, suiteTeardown, test */

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

        fs.mkdir('test_config', function (err) {
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

    test('read jslintrc when present', function () {
        fs.writeFileSync('jslintrc', '{"foo": 1}');

        assert.deepEqual({foo: 1}, options.loadAndParseConfig('jslintrc'));
    });

    test('no crash when empty jslintrc', function () {
        fs.writeFileSync('jslintrc', '');

        assert.deepEqual(undefined, options.loadAndParseConfig('jslintrc'));

        assert.strictEqual('Error reading config file "jslintrc": SyntaxError: Unexpected end of input',
                           con.warnings[0]);
    });

    test('no crash when malformed jslintrc', function () {
        fs.writeFileSync('jslintrc', "{ 'invalid json': true");

        assert.deepEqual(undefined, options.loadAndParseConfig('jslintrc'));

        assert.strictEqual('Error reading config file "jslintrc": SyntaxError: Unexpected end of input',
                           con.warnings[0]);
    });

    test('nonexistent .jslintrc => undefined', function () {
        assert.deepEqual(undefined, options.loadAndParseConfig('.jslintrc'));
    });

    test('merge global and local config correctly', function () {
        fs.writeFileSync('home', '{"foo": 1}');
        fs.writeFileSync('local', '{"foo": 2}');

        // no local = use home
        assert.deepEqual({foo: 1}, options.mergeConfigs(['home'], []));

        // local overrides home
        assert.deepEqual({foo: 2}, options.mergeConfigs(['home'], ['local']));

        // either branch of local overrides home
        assert.deepEqual({foo: 2}, options.mergeConfigs(['home'], ['filenotfound', 'local']));
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
