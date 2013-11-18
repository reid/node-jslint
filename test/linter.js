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
    test('doesnt re-split predefs', function () {
        assert.deepEqual({predef: ['foo', 'bar', 'baz']}, 
                         linter.splitPredefs({predef: ['foo', 'bar', 'baz']}));
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

suite('loadJSLint', function() {
    test('loadJSLint loads something', function () {
        var options = {edition: 'latest'};

        assert.notEqual(undefined, linter.loadJSLint(options));
    });
});

suite('preprocessScript', function () {
    test('removes leading BOM', function () {

        assert.equal('var x=1;', linter.preprocessScript('var x=1;'));

        assert.equal('var x=1;', linter.preprocessScript('\uFEFFvar x=1;'));

    });
    test('removes shebang', function () {

        assert.equal('\nvar x=1;', linter.preprocessScript('#!/usr/bin/env node\nvar x=1;'));

    });
});

suite('lint', function () {
    var oldHome = process.env.HOME;
    teardown(function () {
        process.env.HOME = oldHome;
    });

    test('basic lint step', function () {

        var script = "// only a comment\n",
            options = {edition: 'latest'},
            result;

        // don't let user's config interfere with our test
        process.env.HOME = '';

        result = linter.lint(script, options);
        
        assert.deepEqual({ok: true, errors: [], options: options},
                         result);
    });

    test('lint finds error', function () {

        var script = "//TODO: remove this\n",
            options = {edition: '2013-09-22'},
            result;

        // don't let user's config interfere with our test
        process.env.HOME = '';

        result = linter.lint(script, options);
        
        assert.strictEqual(1, result.errors.length);
        assert.strictEqual("Unexpected TODO comment.", 
                           result.errors[0].raw);

    });
});
