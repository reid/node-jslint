var assert = require('assert'),
    options = require('../lib/options');

suite('addDefaults', function () {
    test('set node, es5 if unset', function () {
        assert.deepEqual({white: false, color: true, node: true, es5: true},
                         options.addDefaults({white: false, color: true}));
    });

    test('explicit set prevents override', function () {
        assert.deepEqual({node: false, es5: false},
                         options.addDefaults({es5: false, node: false}));
        });
});

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

suite('preprocessOptions', function() {
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
            warn: function(str) {
                this.warnings.push(str);
            }
        };
    }

    suiteSetup(function (done) {
        // mock console object
        con = mockConsole();
        options.setConsole(con);

        fs.mkdir('test_config', function (err) {
            if (err) return done(err);
            process.chdir('test_config');
            done();
        });
    });

    suiteTeardown(function (done) {
        process.chdir(oldDir);
        fs.rmrf('test_config', function (err) {
            if (err) return done(err);
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

    test('load specific-named config files', function () {
        fs.writeFileSync('.jslintrc', '{"foo": "home"}');
        fs.writeFileSync('jslintrc', '{"foo": "local"}');

        // pretend current directory is home
        assert.deepEqual({foo: "local"}, options.loadConfig('.'));

        // Windows: process.env.HOME can be unset (undefined)
        assert.deepEqual({foo: "local"}, options.loadConfig(undefined));
    });

    test('load user-named config files', function () {
        fs.writeFileSync('user.jslint.conf', '{"bar": "user"}');

        // pretend current directory is home
        var conf = options.loadConfig('.', './user.jslint.conf');

        assert.equal("user", conf.bar);

    });
});
