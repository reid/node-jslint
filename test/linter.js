var assert = require('assert'),
    linter = require('../lib/linter');

suite('merge', function () {
    test('can merge when no conflict', function () {
        assert.deepEqual({a: 1, b: 2}, linter.merge({a: 1}, {b: 2}));
    });

    test('left side wins on merge', function () {
        assert.deepEqual({a: 1}, linter.merge({a: 1}, {a: 2}));
    });

    test('merge where one or more args is undefined', function () {
        assert.deepEqual({a: 1}, linter.merge({a: 1}, undefined));

        assert.deepEqual({a: 1}, linter.merge(undefined, {a: 1}));
    });
});

suite('addDefaults', function () {
    test('set node, es5 if unset', function () {
        assert.deepEqual({white: false, color: true, node: true, es5: true},
                         linter.addDefaults({white: false}, {color: true}));
    });

    test('explicit set prevents override', function () {
        assert.deepEqual({node: false, es5: false},
                         linter.addDefaults({es5: false}, {node: false}));
        });
});

suite('splitPredefs', function () {
    test('can split predefs', function () {
        assert.deepEqual({predef: ['foo', 'bar', 'baz']}, 
                         linter.splitPredefs({predef: "foo,bar,baz"}));
    });
});


suite('current dir config file', function () {
    var oldDir = process.cwd(),
        fs = require('fs.extra');
    setup(function (done) {
        fs.mkdir('test_config', function (err) {
            if (err) return done(err);
            process.chdir('test_config');
            done();
        });
    });
    teardown(function (done) {
        process.chdir(oldDir);
        fs.rmrf('test_config', function (err) { 
            if (err) return done(err);
            done(); 
        });
    });

    test('read jslintrc when present', function () {
        fs.writeFileSync('jslintrc', '{"foo": 1}');

        assert.deepEqual({foo: 1}, linter.loadAndParseConfig('jslintrc'));
    });

    test('nonexistent .jslintrc => undefined', function () {
        assert.deepEqual(undefined, linter.loadAndParseConfig('.jslintrc'));
    });

    test('merge global and local config correctly', function () {
        fs.writeFileSync('home', '{"foo": 1}');
        fs.writeFileSync('local', '{"foo": 2}');
        
        // no local = use home
        assert.deepEqual({foo: 1}, linter.mergeConfigs('home'));

        // local overrides home 
        assert.deepEqual({foo: 2}, linter.mergeConfigs('home', 'local'));

        // either branch of local overrides home 
        assert.deepEqual({foo: 2}, linter.mergeConfigs('home', 'filenotfound', 'local'));
    });

    test('load specific-named config files', function () {
        fs.writeFileSync('.jslintrc', '{"foo": "home"}');
        fs.writeFileSync('jslintrc', '{"foo": "local"}');
        
        // pretend current directory is home
        assert.deepEqual({foo: "local"}, linter.loadConfig('.'));

        // Windows: process.env.HOME can be unset (undefined)
        assert.deepEqual({foo: "local"}, linter.loadConfig(undefined));
    });

});
